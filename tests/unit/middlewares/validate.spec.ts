import validate from '../../../src/middlewares/validate';
import Joi from 'joi';
import ApiError from '../../../src/utils/error/ApiError';
import httpStatus from 'http-status';
import { NextFunction, Request, Response } from 'express';

describe('validate', () => {
  const mockReq = (body: any) =>
    ({
      body,
    }) as Request;

  const mockRes = {} as Response;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockNext = jest.fn();
  });

  it('should validate and pass for valid input', () => {
    const schema = {
      body: Joi.object().keys({
        name: Joi.string().required(),
      }),
    };

    const req = mockReq({ name: 'John Doe' });

    validate(schema)(req, mockRes, mockNext);

    expect(req.body).toEqual({ name: 'John Doe' });
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should throw ApiError for invalid input', () => {
    const schema = {
      body: Joi.object().keys({
        name: Joi.string().required(),
      }),
    };

    const req = mockReq({ name: 123 });

    validate(schema)(req, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: httpStatus.BAD_REQUEST,
        message: expect.stringContaining('"name" must be a string'),
      })
    );
  });
});
