import { tokenTypes } from '@config/tokens';
import toJSON from '@utils/mongoose/toJSON.plugin';
import paginate from '@/utils/mongoose/paginate.plugin';
import { Schema, model, Model } from 'mongoose';
import { IBaseModel } from '@/abstracts/model.base';

export interface IToken extends IBaseModel {
  token: string;
  user: Schema.Types.ObjectId;
  type: string;
  expires: Date;
  blacklisted?: boolean;
}

/** Custom Methods */
//export interface ITokenMethods {}
// You can use the interface when you want to add static method
export type ITokenMethods = {};

/**
 * Mongoose model
 */
export type TokenModel = Model<IToken, {}, ITokenMethods>;

/**
 * Mongoose Schema
 */
const tokenSchema = new Schema<IToken, TokenModel, ITokenMethods>(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        tokenTypes.REFRESH,
        tokenTypes.RESET_PASSWORD,
        tokenTypes.VERIFY_EMAIL,
      ],
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

tokenSchema.plugin(toJSON);
tokenSchema.plugin(paginate);

/**
 * Token mongoose model
 *
 * @typedef Token
 */
const Token = model<IToken, TokenModel>('Token', tokenSchema);
export default Token;
