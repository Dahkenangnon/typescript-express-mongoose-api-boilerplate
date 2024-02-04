import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import config from '@config';
import { tokenTypes } from './tokens';
import UserService from '@features/user/services';
import { Container } from 'typedi';
import { logger } from '@/utils/logger';
import ApiError from '@/utils/error/ApiError';
import httpStatus from 'http-status';

/** Jwt options */
const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

/**
 * Verifies the token extracted from the request
 *
 * @param payload The payload extracted from the token
 * @param done The callback to be called when finished
 * @returns Promise<any>
 */
export const jwtVerify = async (payload: any, done: any) => {
  const userService = Container.get(UserService);

  try {
    if (payload.type !== tokenTypes.ACCESS) {
      logger.error('Invalid token type');
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token type');
    }
    const user = await userService.readOne({ id: payload.sub });
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    logger.error('JwtVerify: ', error);
    done(error, false);
  }
};

export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
