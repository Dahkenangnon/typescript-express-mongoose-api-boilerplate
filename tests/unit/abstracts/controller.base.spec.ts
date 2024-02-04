import { BaseController } from '../../../src/abstracts/controller.base';
import { BaseService } from '../../../src/abstracts/service.base';
import { Document, Model } from 'mongoose';
import { Request, Response } from 'express';
import { mock, MockProxy } from 'jest-mock-extended';
import httpStatus from 'http-status';

class MockModel {}
type MockModelMethods = {};
class MockService extends BaseService<
  MockModel,
  MockModelMethods,
  Model<MockModel, {}, MockModelMethods>
> {}

describe('BaseController', () => {
  let service: MockProxy<MockService> & MockService;
  let req: MockProxy<Request>;
  let res: MockProxy<Response>;
  let controller: MockController;
  let next: jest.Mock;
  type T = Document<unknown, {}, MockModel> &
    MockModel &
    Required<{ _id: unknown }>;

  class MockController extends BaseController<
    MockModel,
    MockModelMethods,
    Model<MockModel, {}, MockModelMethods>
  > {
    constructor(
      service: BaseService<
        MockModel,
        MockModelMethods,
        Model<MockModel, {}, MockModelMethods>
      >
    ) {
      super(service, [], [], []);
    }
  }

  beforeEach(() => {
    service = mock<MockService>();
    controller = new MockController(service);
    req = mock<Request>();
    res = mock<Response>();
    res = {
      ...res,
      status: jest.fn().mockReturnThis() as any,
      send: jest.fn() as any,
    };
    next = jest.fn();
  });

  it('should read one item', async () => {
    const item = new MockModel() as T;
    service.readOne.mockResolvedValue(item);

    await controller.readOne(req, res, next);

    expect(service.readOne).toHaveBeenCalledWith({ _id: req.params.id });
    expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
    expect(res.status(httpStatus.OK).send).toHaveBeenCalledWith(item);
  });

  it('should read many items', async () => {
    const items = [new MockModel(), new MockModel()] as T[];
    service.readMany.mockResolvedValue(items);

    await controller.readMany(req, res, next);

    expect(service.readMany).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
    expect(res.status(httpStatus.OK).send).toHaveBeenCalledWith(items);
  });

  it('should create one item', async () => {
    const item = new MockModel() as T;
    service.createOne.mockResolvedValue(item);

    await controller.createOne(req, res, next);

    expect(service.createOne).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
    expect(res.status(httpStatus.OK).send).toHaveBeenCalledWith(item);
  });

  it('should create many items', async () => {
    const items = [new MockModel(), new MockModel()] as T[];
    service.createMany.mockResolvedValue(items);

    await controller.createMany(req, res, next);

    expect(service.createMany).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
    expect(res.status(httpStatus.OK).send).toHaveBeenCalledWith(items);
  });

  it('should update one item', async () => {
    const item = new MockModel() as T;
    service.updateOne.mockResolvedValue(item);

    await controller.updateOne(req, res, next);

    expect(service.updateOne).toHaveBeenCalledWith(
      { id: req.params.id },
      req.body
    );
    expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
    expect(res.status(httpStatus.OK).send).toHaveBeenCalledWith(item);
  });

  it('should delete one item', async () => {
    const item = new MockModel() as T;
    service.deleteOne.mockResolvedValue(item);

    await controller.deleteOne(req, res, next);

    expect(service.deleteOne).toHaveBeenCalledWith({ id: req.params.id });
    expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
    expect(res.status(httpStatus.OK).send).toHaveBeenCalledWith(item);
  });

  it('should read many items paginated', async () => {
    const result = {
      results: [new MockModel(), new MockModel()],
      page: 1,
      limit: 10,
      totalPages: 1,
      totalResults: 2,
    };
    service.readManyPaginated.mockResolvedValue(result);

    await controller.readManyPaginated(req, res, next);

    expect(service.readManyPaginated).toHaveBeenCalledWith({}, {});
    expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
    expect(res.status(httpStatus.OK).send).toHaveBeenCalledWith(result);
  });

  it('should update many items', async () => {
    const items = [new MockModel(), new MockModel()];
    service.updateMany.mockResolvedValue(items as any);

    await controller.updateMany(req, res, next);

    expect(service.updateMany).toHaveBeenCalledWith({}, req.body);
    expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
    expect(res.status(httpStatus.OK).send).toHaveBeenCalledWith(items);
  });

  it('should delete many items', async () => {
    const items = [new MockModel(), new MockModel()];
    service.deleteMany.mockResolvedValue(items as any);

    await controller.deleteMany(req, res, next);

    expect(service.deleteMany).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
    expect(res.status(httpStatus.OK).send).toHaveBeenCalledWith(items);
  });
});
