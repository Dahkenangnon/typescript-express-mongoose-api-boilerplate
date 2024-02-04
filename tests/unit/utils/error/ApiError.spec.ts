import ApiError from '../../../../src/utils/error/ApiError';

describe('ApiError', () => {
  it('should initialize with given values', () => {
    const error = new ApiError(400, 'Test error', true, 'Test stack');

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Test error');
    expect(error.isOperational).toBe(true);
    expect(error.stack).toBe('Test stack');
  });

  it('should capture stack trace if not provided', () => {
    const error = new ApiError(400, 'Test error');

    expect(error.stack).toBeDefined();
  });
});
