import { NextFunction, Request, RequestHandler, Response } from 'express';

/*
 * Catch async errors
 *
 * The purpose of this function is to catch async errors in `fn` and pass them to the next middleware.
 *
 * It allows to avoid writing try/catch blocks in each controller.
 *
 * @example
 *
 * // Instead of writing this:
 *
 * export const getMe = async (req: Request, res: Response, next: NextFunction) => {
 *  try {
 *
 *   // Do something
 *
 * } catch (error) {
 *  next(error);
 * }
 *
 * // You can write this:
 *
 * export const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
 *
 *  // Do something
 *
 * });
 *
 * @param {Function} fn - The function to execute. Generally a controller but can be any function middleware like function.
 * @returns Promise<any>
 */
const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) =>
  ((req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  }) as RequestHandler;

export default catchAsync;
