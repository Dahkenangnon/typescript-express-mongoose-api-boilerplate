import { Model } from 'mongoose';
import { IBaseModel } from './model.base';
import { UpdateWriteOpResult } from 'mongoose';
import { DeleteResult } from 'mongodb';

/**
 * Mongoose Service Base class.
 *
 * Example of use:
 *
 * ```ts
 * import { BaseService } from '@/abstracts/service.base';
 *
 * // ... import IModelType, IModelMethods, MongooseModel from the model file
 *
 * MessageService extends BaseService<IMessage, IMessageMethods, MessageModel> {}
 * ```
 */
export abstract class BaseService<
  IModelType extends IBaseModel,
  IModelMethods,
  MongooseModel extends Model<IModelType, {}, IModelMethods>,
> {
  /** The mongoose object this service is belonged to */
  protected model: MongooseModel;
  constructor(model: MongooseModel) {
    this.model = model;
  }

  /**
   * Create a new document in the database
   *
   * @param data Data to create a new model with
   * @returns Promise<IModelType>
   */
  async createOne(data: any) {
    const newModel = new this.model(data);
    return await newModel.save();
  }

  /**
   * Create many documents in the database in same time
   *
   * @param data Array of object data to create many models with
   * @returns Promise<IModelType[]>
   */
  async createMany(data: any[]) {
    return await this.model.insertMany(data);
  }

  /**
   * Read many documents from the database based on the filter
   *
   * @param filter The filter to apply on the query
   * @returns Promise<IModelType[]>
   */
  async readMany(filter: any) {
    return await this.model.find(filter);
  }

  /**
   * Read many paginated documents from the database based on the filter and options
   *
   * @param filter Filter to apply on the query
   * @param options Options to apply on the query can be: limit, page, sortBy for pagination purpose
   * @returns
   */
  async readManyPaginated(filter: any, options: any) {
    // options.populate = 'author';
    return await (this.model as any).paginate(filter, options);
  }

  /**
   * Read one document from the database based on the filter
   *
   * @param filter Filter to apply on the query
   * @returns Promise<IModelType | null>
   */
  async readOne(filter: any) {
    if (filter.id) {
      filter._id = filter.id;
      delete filter.id;
    }

    return await this.model.findOne(filter);
  }

  /**
   * Update one document from the database based on the filter
   *
   * @param filter The filter to apply on the query
   * @param data The data to update the document with
   * @returns Promise<IModelType | null>
   */
  async updateOne(filter: any, data: any) {
    if (filter.id) {
      filter._id = filter.id;
      delete filter.id;
    }
    return await this.model.findOneAndUpdate(filter, data, { new: true });
  }

  /**
   * Update many documents from the database based on the filter
   *
   * @param filter The filter to apply on the query
   * @param data The data to update the documents with.
   * This is an object not an array of objects
   * @returns Promise<UpdateWriteOpResult>
   */
  async updateMany(filter: any, data: any): Promise<UpdateWriteOpResult> {
    if (filter.id) {
      filter._id = filter.id;
      delete filter.id;
    }
    return await this.model.updateMany(filter, data);
  }

  /**
   * Delete one document from the database based on the filter
   *
   * @param filter The filter to apply on the query
   * @returns Promise<IModelType | null>
   */
  async deleteOne(filter: any) {
    if (filter.id) {
      filter._id = filter.id;
      delete filter.id;
    }
    return await this.model.findOneAndDelete(filter);
  }

  /**
   * Delete many documents from the database based on the filter
   *
   * @param filter The filter to apply on the query
   * @returns Promise<DeleteResult>
   */
  async deleteMany(filter: any): Promise<DeleteResult> {
    if (filter.id) {
      filter._id = filter.id;
      delete filter.id;
    }
    return await this.model.deleteMany(filter);
  }
}
