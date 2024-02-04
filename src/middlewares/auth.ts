import httpStatus from 'http-status';
import ApiError from '../utils/error/ApiError';
import { roleRights } from '../config/roles';
import passport from 'passport';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { IUser } from '@/features/user/entities/user.entity';
import { logger } from '@/utils/logger';

type VerifyCallback = (err: any, user: any, info: any) => Promise<void>;

export const createVerifyCallback =
  (req: Request, requiredRights: string[]): VerifyCallback =>
  async (err, user, info) => {
    if (err || info || !user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication failed');
    }

    req.user = user as IUser;

    if (requiredRights.length) {
      const userRights = roleRights.get(user.role);
      if (
        !requiredRights.every(
          (requiredRight: string) =>
            (userRights as string[])?.includes(requiredRight)
        )
      ) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "You don't have enough permissions"
        );
      }
    }
  };

const auth = (...requiredRights: string[]) =>
  ((req: Request, res: Response, next: NextFunction): void => {
    return passport.authenticate(
      'jwt',
      { session: false },
      (err: any, user: any, info: any) => {
        createVerifyCallback(req, requiredRights)(err, user, info)
          .then(() => next())
          .catch((err) => {
            logger.error('Auth ', err);
            next(err);
          });
      }
    )(req, res, next);
  }) as RequestHandler;

export default auth;
