import nodemailer from 'nodemailer';
import { EmailUtils } from '../../../../src/utils/email';
import config from '../../../../src/config';
import { logger } from '../../../../src/utils/logger';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    verify: jest.fn(),
  }),
}));

jest.mock('../../../../src/config', () => ({
  email: {
    smtp: 'smtp://localhost',
  },
  env: 'test',
}));

jest.mock('../../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('EmailUtils', () => {
  let emailUtils: EmailUtils;

  beforeEach(() => {
    emailUtils = EmailUtils.getInstance();
  });

  describe('connectToEmailServer', () => {
    it('should connect to email server in non-test environment', async () => {
      config.env = 'development';
      const result = await emailUtils.connectToEmailServer();
      expect(result).toBe(true);
      expect(logger.info).toHaveBeenCalledWith('🟢 Connected to email server');
    });

    it('Should be able to skip some environnement when trying to connect', async () => {
      const result1 = await emailUtils.connectToEmailServer(['test']);
      expect(result1).toBe(true);
    });

    it('should handle connection error', async () => {
      config.env = 'development';
      (nodemailer.createTransport().verify as jest.Mock).mockRejectedValueOnce(
        new Error('Connection error')
      );
      const result = await emailUtils.connectToEmailServer();
      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith(
        '🔴 Unable to connect to email server. Make sure you have configured the SMTP options in .env'
      );
    });
  });
});
