import toJSON from '@utils/mongoose/toJSON.plugin';
import paginate from '@/utils/mongoose/paginate.plugin';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { Schema, model, Model } from 'mongoose';
import { IBaseModel } from '@/abstracts/model.base';
import config from '@/config';

/**
 * User interface
 * 
 * If any array in this interface , use Types.Array or Types.DocumentArray from mongoose
 * @see https://mongoosejs.com/docs/typescript/schemas.html#arrays
 * 
 * @example 
 * 
 * import { Schema, Model, Types } from 'mongoose';

    interface BlogPost {
    _id: Types.ObjectId;
    title: string;
    }

    interface User {
    tags: Types.Array<string>;
    blogPosts: Types.DocumentArray<BlogPost>;
    }

    const schema = new Schema<User, Model<User>>({
    tags: [String],
    blogPosts: [{ title: String }]
    });

    // For example, this would work:
    const user = new User({ blogPosts: [] });

    user.blogPosts.push({ title: 'test' }); // Would not work if you did `blogPosts: BlogPost[]`
 */
export interface IUser extends IBaseModel {
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  email: string;
  avatar?: string;
  avatar_metadata?: any;
  isEmailVerified?: boolean;
}

/** All custom defined methods on the User model */
export interface IUserMethods {
  /**
   * Check if password matches the user's password
   *
   * @param {string} password
   * @returns {Promise<boolean>}
   */
  isPasswordMatch(password: string): string;
}

/**
 * User mongoose model
 */
export interface UserModel extends Model<IUser, {}, IUserMethods> {
  /**
   * Check if email is taken
   * @param {string} email - The user's email
   * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
   * @returns {Promise<boolean>}
   */
  isEmailTaken(email: string, excludeUserId?: string): number;
}

/**
 * User Schema
 * @private
 */
const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: config.validation.username.min,
      maxlength: config.validation.username.max,
    },
    lastName: {
      type: String,
      required: true,
      minlength: config.validation.username.min,
      maxlength: config.validation.username.max,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: config.validation.email.min,
      maxlength: config.validation.email.max,
      lowercase: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: config.validation.password.min, // Should be set to 12 in production
      maxlength: config.validation.password.max,
      private: true, // used by the toJSON plugin to hide the password field when calling toJson()
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
    },
    avatar_metadata: {
      type: Object,
    },
  },
  { timestamps: true }
);

userSchema.plugin(toJSON as any);
userSchema.plugin(paginate as any);

/** Static method isEmailTaken */
userSchema.static(
  'isEmailTaken',
  async function isEmailTaken(email: string, excludeUserId: string) {
    if (excludeUserId) {
      return !!(await this.findOne({ email, _id: { $ne: excludeUserId } }));
    }

    const user = await this.findOne({ email });
    return !!user;
  }
);

/** Method isPasswordMatch */
userSchema.method(
  'isPasswordMatch',
  async function isPasswordMatch(password: string) {
    return bcrypt.compare(password, this.password);
  }
);

/** Hook pre save */
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

userSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as any;
  const password = update.password;
  if (password) {
    update.password = await bcrypt.hash(password, 8);
  }
  next();
});

/**
 * User mongoose model
 *
 * @typedef User
 */
const User = model<IUser, UserModel>('User', userSchema);
export default User;
