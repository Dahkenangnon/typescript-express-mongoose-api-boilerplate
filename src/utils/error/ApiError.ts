export default class ApiError extends Error {
  /** Http status code */
  statusCode: number;
  /** Whether programmer error or unexpected error
   * @see {@link https://levelup.gitconnected.com/distinction-between-operational-error-and-programmer-error-in-nodejs-bd77bca8da1}
   */
  isOperational: boolean;
  /** Stack trace */
  stack?: string;

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
