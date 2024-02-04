import catchAsync from '.../../../src/utils/error/catchAsync';
import { NextFunction, Request, Response } from 'express';

describe('catchAsync', () => {
  let mockFn: jest.Mock;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockFn = jest.fn();
    mockReq = {};
    mockRes = {};
    mockNext = jest.fn();
  });

  it('should call the function with req, res, and next', async () => {
    const wrappedFn = catchAsync(mockFn);

    await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

    expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
  });

  it('should pass errors to next', async () => {
    const error = new Error('test error');
    mockFn.mockRejectedValueOnce(error);
    const wrappedFn = catchAsync(mockFn);

    await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
