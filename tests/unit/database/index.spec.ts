import { connect } from 'mongoose';
import { logger } from '../../../src/utils/logger';
import config from '../../../src/config';
import { connectDB } from '../../../src/database';

jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('connectDB', () => {
  it('should connect to the database', async () => {
    (connect as jest.Mock).mockResolvedValueOnce(true);

    await connectDB();

    expect(connect).toHaveBeenCalledWith(config.db.uri, config.db.options);
    expect(logger.info).toHaveBeenCalledWith('🟢 The database is connected.');
  });

  it('should throw an error if the connection fails', async () => {
    const error = new Error('Unable to connect');
    (connect as jest.Mock).mockRejectedValueOnce(error);

    await expect(connectDB()).rejects.toThrow(error);
    expect(logger.error).toHaveBeenCalledWith(
      `❌ Unable to connect to the database: ${error.message}`
    );
  });
});
