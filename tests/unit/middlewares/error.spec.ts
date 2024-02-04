import httpStatus from 'http-status';
import { errorConverter, errorHandler } from '../../../src/middlewares/error';
import ApiError from '../../../src/utils/error/ApiError';
import mongoose from 'mongoose';

describe('Error Middlewares', () => {
  describe('errorConverter', () => {
    it('should convert a mongoose error to ApiError with status BAD_REQUEST', () => {
      const mongooseError = new mongoose.Error('Mongoose error');
      const next = jest.fn();

      errorConverter(mongooseError, {} as any, {} as any, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: httpStatus.BAD_REQUEST })
      );
    });
  });

  describe('errorHandler', () => {
    it('should send the status code and message of the error in the response', () => {
      const apiError = new ApiError(httpStatus.BAD_REQUEST, 'Any error', true);
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        locals: {},
      } as any;

      errorHandler(apiError, {} as any, res, {} as any);

      expect(res.status).toHaveBeenCalledWith(apiError.statusCode);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: apiError.message })
      );
    });
  });
});
