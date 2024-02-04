import httpStatus from 'http-status';
import config from '@config';
import { logger } from '@/utils/logger';
import ApiError from '@/utils/error/ApiError';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

/**
 * Convert any other error to ApiError
 *
 * This is a middleware that converts any error to ApiError.
 * @see app.ts for usage
 * @param {Error} err - Error
 * @param {Request} req - Request
 * @param {Response} res - Response
 * @param {NextFunction} next - NextFunction
 * @returns {Function} - Express NextFunction
 *
 */
export const errorConverter = (
  err: any,
  _req: Request,
  _res: Response,
  next: NextFunction
): void => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error
        ? httpStatus.BAD_REQUEST
        : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

/**
 * Handle ApiError and send response
 *
 * This is a middleware that handles ApiError and sends the response.
 * @see app.ts for usage
 * @param {ApiError} err - ApiError
 * @param {Request} req - Request
 * @param {Response} res - Response
 * @param {NextFunction} next - NextFunction
 * @returns {Function} - Express NextFunction
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let { statusCode, message } = err;
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  };

  if (config.env === 'development') {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};
