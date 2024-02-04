import { logger } from '@/utils/logger';
import config from '@config';
import { ConnectOptions, connect } from 'mongoose';

/** MongoDB connection options connection function */
export const connectDB = async () => {
  return await connect(config.db.uri, config.db.options as ConnectOptions)
    .then(() => {
      logger.info('🟢 The database is connected.');
    })
    .catch((error: Error) => {
      logger.error(`❌ Unable to connect to the database: ${error.message}`);
      throw error; // Transfer the error to the caller
    });
};
