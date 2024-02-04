import { IBaseModel } from './model.base';
import { BaseService } from './service.base';
import { Model } from 'mongoose';
import pick from '@/utils/pick/pick';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '@/utils/error/catchAsync';

/**
 * Base class for controllers
 */
export abstract class BaseController<
  IModelType extends IBaseModel,
  IModelMethods,
  MongooseModel extends Model<IModelType, {}, IModelMethods>,
> {
  /** The Main service this CRUD controller is for. Note that the controller can use any other service it want */
  protected service: BaseService<IModelType, IModelMethods, MongooseModel>;
  /** Filter options to pick from the request in readMany operation */
  protected filterFields: Array<keyof IModelType> = [
    'createdAt',
    'updatedAt',
    '_id',
  ];
  /** Options to pick from the request in readMany operation, e.g. sortBy, limit, page */
  protected optionsFields: Array<string> = ['sortBy', 'limit', 'page'];
  /** Fields to populate in readOne operation and readMany operation */
  protected populateFields: Array<keyof IModelType> = [];
  /** Filter options based on which, we can process update many operations */
  protected updateManyFilterFields: Array<keyof IModelType> = [];
  /** Filter options based on which, we can process delete many operations */
  protected deleteManyFilterFields: Array<keyof IModelType> = [];

  constructor(
    service: BaseService<IModelType, IModelMethods, MongooseModel>,
    filterFields: Array<keyof IModelType>,
    optionsFields: Array<string>,
    populateFields: Array<keyof IModelType> = [],
    updateManyFilterFields: Array<keyof IModelType> = [],
    deleteManyFilterFields: Array<keyof IModelType> = []
  ) {
    this.service = service;
    this.filterFields = filterFields;
    this.optionsFields = optionsFields;
    this.populateFields = populateFields;
    this.updateManyFilterFields = updateManyFilterFields;
    this.deleteManyFilterFields = deleteManyFilterFields;
  }

  /**
   * Read one item by id
   *
   * @param req The express request object
   * @param res The express response object
   * @returns Promise<void>
   */
  public readOne = catchAsync(async (req: Request, res: Response) => {
    const item = await this.service.readOne({ id: req.params.id });
    res.status(httpStatus.OK).send(item);
  });

  /**
   * Read all items
   *
   * @param req The express request object
   * @param res The express response object
   * @returns Promise<void>
   */
  public readMany = catchAsync(async (_req: Request, res: Response) => {
    const items = await this.service.readMany({});
    res.status(httpStatus.OK).send(items);
  });

  /**
   * Create one item
   *
   * @param req The express request object
   * @param res The express response object
   * @returns Promise<void>
   */
  public createOne = catchAsync(async (req: Request, res: Response) => {
    const newItem = await this.service.createOne(req.body);
    res.status(httpStatus.OK).send(newItem);
  });

  /**
   * Create many items, e.g. bulk insert.
   *
   * Note: req.body must be an array of items
   *
   * @param req The express request object
   * @param res The express response object
   * @returns Promise<void>
   */
  public createMany = catchAsync(async (req: Request, res: Response) => {
    const newItems = await this.service.createMany(req.body);
    res.status(httpStatus.OK).send(newItems);
  });

  /**
   * Update one item by id
   *
   * @param req The express request object
   * @param res The express response object
   * @returns Promise<void>
   */
  public updateOne = catchAsync(async (req: Request, res: Response) => {
    const updatedItem = await this.service.updateOne(
      { id: req.params.id },
      req.body
    );
    res.status(httpStatus.OK).send(updatedItem);
  });

  /**
   * Update many items by filter
   *
   * Note: req.body must be an object of fields to update and
   * this.updateManyFilterFields must be an array of fields to filter by
   *
   * @param req The express request object
   * @param res The express response object
   * @returns Promise<void>
   */
  public updateMany = catchAsync(async (req: Request, res: Response) => {
    const filter = pick(req.query, this.updateManyFilterFields as string[]);
    const data: Partial<IModelType> = req.body;
    const updatedItems = await this.service.updateMany(filter, data);
    res.status(httpStatus.OK).send(updatedItems);
  });

  /**
   * Delete one item by id
   *
   * @param req The express request object
   * @param res The express response object
   * @returns Promise<void>
   */
  public deleteOne = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const deletedItem = await this.service.deleteOne({ id });
    res.status(httpStatus.OK).send(deletedItem);
  });

  /**
   * Delete many items by filter
   *
   * @example
   *
   * // Using ids and other fields to filter what to delete
   * const q = {
   *  id: [1, 2, 3],
   * title: 'hello',
   * isArchived: true,
   * };
   *
   * const qUrl = '/api/v1/messages?id=1&id=2&id=3&title=hello&isArchived=true';
   *
   * // To delete all element where ids are in [1, 2, 3], we can pass {id: [1, 2, 3]}.
   * const qUrl = '/api/v1/messages?id=1&id=2&id=3'
   *
   * @param req The express request object
   * @param res The express response object
   * @returns Promise<void>
   */
  public deleteMany = catchAsync(async (req: Request, res: Response) => {
    const filter = pick(req.query, this.deleteManyFilterFields as string[]);
    const deletedItems = await this.service.deleteMany(filter);
    res.status(httpStatus.OK).send(deletedItems);
  });

  /**
   * Read many items with pagination
   *
   * @param req The express request object
   * @param res The express response object
   * @returns Promise<void>
   */
  public readManyPaginated = catchAsync(async (req: Request, res: Response) => {
    const filter = pick(req.query, this.filterFields as string[]);
    const options = pick(req.query, this.optionsFields);
    const data = await this.service.readManyPaginated(filter, options);
    res.status(httpStatus.OK).send(data);
  });
}
