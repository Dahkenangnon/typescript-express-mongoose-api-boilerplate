import passport from 'passport';
import { NextFunction, Request, Response } from 'express';
import { roleRights } from '../../../src/config/roles';
import { IUser } from '../../../src/features/user/entities/user.entity';
import auth, { createVerifyCallback } from '../../../src/middlewares/auth';

jest.mock('passport', () => ({
  authenticate: jest.fn().mockImplementation(() => jest.fn()),
}));
jest.mock('../../../src/utils/logger');

describe('Auth', () => {
  const mockRequest = {
    user: null,
  } as unknown as Request;
  const mockResponse = {} as Response;
  const mockNext = jest.fn() as NextFunction;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createVerifyCallback', () => {
    it('should throw an error if user is not authenticated', async () => {
      const callback = createVerifyCallback(mockRequest, []);
      await expect(callback(new Error(), null, null)).rejects.toThrow(
        'Authentication failed'
      );
    });

    it('should add user to request object', async () => {
      const mockUser = { role: 'user' } as IUser;
      const callback = createVerifyCallback(mockRequest, []);
      await callback(null, mockUser, null);
      expect(mockRequest.user).toBe(mockUser);
    });

    it('should throw an error if user does not have required rights', async () => {
      const mockUser = { role: 'user' } as IUser;
      roleRights.set('user', ['right1']);
      const callback = createVerifyCallback(mockRequest, ['right2']);
      await expect(callback(null, mockUser, null)).rejects.toThrow(
        "You don't have enough permissions"
      );
    });
  });

  describe('auth', () => {
    it('should call passport authenticate', () => {
      auth()(mockRequest, mockResponse, mockNext);
      expect(passport.authenticate).toHaveBeenCalled();
    });
  });
});
