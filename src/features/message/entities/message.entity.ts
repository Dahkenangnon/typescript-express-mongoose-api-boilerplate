import toJSON from '@utils/mongoose/toJSON.plugin';
import paginate from '@/utils/mongoose/paginate.plugin';
import { Schema, model, Model } from 'mongoose';
import { IBaseModel } from '@/abstracts/model.base';

/**
 * Typescript Interface
 */
export interface IMessage extends IBaseModel {
  title: string;
  content: string;
  thumbnail?: string;
  author: Schema.Types.ObjectId;
  isArchived?: boolean;
}

/** Custom Methods */
//export interface IMessageMethods {}
export type IMessageMethods = {};

/**
 * Mongoose model
 */
export type MessageModel = Model<IMessage, {}, IMessageMethods>;

/**
 * Mongoose Schema
 */
const messageSchema = new Schema<IMessage, MessageModel, IMessageMethods>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    thumbnail: { type: String },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isArchived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

messageSchema.plugin(toJSON);
messageSchema.plugin(paginate);

/**
 * Message mongoose model
 *
 * @typedef Message
 */
const Message = model<IMessage, MessageModel>('Message', messageSchema);
export default Message;
