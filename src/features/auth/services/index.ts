import httpStatus from 'http-status';
import { tokenTypes } from '@config/tokens';
import UserService from '@/features/user/services';
import Container, { Service } from 'typedi';
import Token, {
  IToken,
  ITokenMethods,
  TokenModel,
} from '../entities/token.entity';
import { BaseService } from '@/abstracts/service.base';
import moment, { Moment } from 'moment';
import config from '@/config';
import jwt from 'jsonwebtoken';
import ApiError from '@/utils/error/ApiError';
import { logger } from '@/utils/logger';
import { IUser } from '@/features/user/entities/user.entity';

@Service()
export default class AuthService extends BaseService<
  IToken,
  ITokenMethods,
  TokenModel
> {
  public userService = Container.get(UserService);

  constructor() {
    super(Token);
  }

  /**
   * Login with username and password
   *
   * @param {string} email The user email
   * @param {string} password The user password
   * @returns {Promise<IUser>} Authenticated user if any
   * @throws {ApiError} If user credentials are wrong
   */
  async login(email: string, password: string): Promise<IUser> {
    const user = await this.userService.readOne({ email: email });
    if (!user || !(await user.isPasswordMatch(password))) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        'Incorrect email or password'
      );
    }
    return user;
  }

  /**
   * Logout user by removing the refresh token from the database
   *
   * @param {string} refreshToken The previous refresh token sent to the client who request the logout
   * @returns {Promise<any>} The promise resolves when the refresh token is removed
   * Note: Keep silence if the refresh token is not found
   */
  async logout(refreshToken: string): Promise<any> {
    const refreshTokenDoc = await this.readOne({
      token: refreshToken,
      type: tokenTypes.REFRESH,
      blacklisted: false,
    });
    if (refreshTokenDoc) {
      return await this.deleteOne({ id: refreshTokenDoc.id });
    }
  }

  /**
   * Regenerate new pair of access token and refresh token to be sent to the client
   *
   * Note: The old refresh token is deleted from the database
   * and we check for token blacklisting before generating the new pair
   *
   * @param {string} refreshToken The previous refresh token sent to the client who request the refresh
   * @returns {Promise<Object | any>} The promise resolves with the new pair of access token and refresh token
   * @throws {ApiError} If the refresh token is not found
   */
  async refreshAuth(refreshToken: string): Promise<Object | any> {
    try {
      const refreshTokenDoc = await this.verifyToken(
        refreshToken,
        tokenTypes.REFRESH
      );

      // If token is blacklisted, the user is not allowed to refresh, deny the request
      if (refreshTokenDoc.blacklisted) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'You are not allowed to do this action.'
        );
      }

      const user = await this.userService.readOne({ id: refreshTokenDoc.user });
      // Ensure that the user exists
      if (!user) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'No integrated user found to refresh'
        );
      }

      // Remove the previous refresh token to ensure user don't have multiple refresh tokens active
      await this.deleteOne({ id: refreshTokenDoc.id });

      // When the refresh token is valid, a new pair of access token and refresh token is generated
      return this.generateAuthTokens(user);
    } catch (error) {
      logger.error('AuthService: refreshAuth: ', error);
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }
  }

  /**
   * Reset password of a user
   *
   * @param {string} resetPasswordToken The reset password token sent to the user email
   * @param {string} newPassword The new user password as raw string not hashed (hashing is done in the user model)
   * @returns {Promise<any>} The promise resolves when the password is reset
   * @throws {ApiError} If the reset password token is not found or the user is not found
   */
  async resetPassword(
    resetPasswordToken: string,
    newPassword: string
  ): Promise<any> {
    try {
      const resetPasswordTokenDoc = await this.verifyToken(
        resetPasswordToken,
        tokenTypes.RESET_PASSWORD
      );
      const user = await this.userService.readOne({
        id: resetPasswordTokenDoc.user,
      });
      if (!user) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'No integrated user found to reset password'
        );
      }
      await this.userService.updateOne(
        { id: user.id },
        { password: newPassword }
      );
      await this.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
    } catch (error) {
      logger.error('AuthService: resetPassword: ', error);
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
    }
  }

  /**
   * Set the user email as verified based on the verify email token validity
   *
   * @param {string} verifyEmailToken The previous verify email token sent to the client who request the verification
   * @returns {Promise<any>} The promise resolves when the email is verified
   * @throws {ApiError} If the verify email token is not found or the user is not found
   */
  async verifyEmail(verifyEmailToken: string): Promise<any> {
    try {
      const verifyEmailTokenDoc = await this.verifyToken(
        verifyEmailToken,
        tokenTypes.VERIFY_EMAIL
      );
      const user = await this.userService.readOne({
        id: verifyEmailTokenDoc.user,
      });
      if (!user) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'No integrated user found to verify email'
        );
      }
      await this.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
      await this.userService.updateOne(
        { id: user.id },
        { isEmailVerified: true }
      );
    } catch (error) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
    }
  }

  /**
   * Sign the payload into a JWT token to be used as a Bearer token or other token (e.g. refresh token)
   *
   * @param {ObjectId} userId The user id to whom this token will belong to
   * @param {Moment} expires Expiration date of the token as a Moment object
   * @param {string} type The type of the token (e.g. access, refresh, resetPassword, verifyEmail)
   * @param {string} [secret] The secret key to sign the token with. This is from the config file
   * @returns {string} The signed token as a string
   */
  public generateToken(
    userId: string,
    expires: Moment,
    type: string,
    secret: string = config.jwt.secret
  ): string {
    const payload = {
      sub: userId,
      iat: moment().unix(),
      exp: expires.unix(),
      type,
    };
    return jwt.sign(payload, secret);
  }

  /**
   * Save a token to the database and ensure no more than one token for the user exists
   *
   * @param {string} token The token to save
   * @param {ObjectId} userId The user id
   * @param {Moment} expires Expiration date of the token as a Moment object
   * @param {string} type The type of the token (e.g. access, refresh, resetPassword, verifyEmail)
   * @param {boolean} [blacklisted] Whether this token is blacklisted or not
   * @returns {Promise<IToken>} The saved token as a document
   */
  async saveToken(
    token: string,
    userId: string,
    expires: Moment,
    type: string,
    blacklisted = false
  ): Promise<IToken> {
    await this.deleteMany({ user: userId, type });

    const tokenDoc = await this.createOne({
      token,
      user: userId,
      expires: expires.toDate(),
      type,
      blacklisted,
    });

    return tokenDoc as unknown as IToken;
  }

  /**
   * Verify token and return token doc (or throw an error if it is not valid)
   *
   * @param {string} token The token to verify
   * @param {string} type The given token type
   * @returns {Promise<IToken>} The token document if it is valid
   * @throws {ApiError} If the token is not valid
   */
  async verifyToken(token: string, type: string): Promise<IToken> {
    const payload = jwt.verify(token, config.jwt.secret);
    const tokenDoc = await this.readOne({
      token,
      type,
      user: payload.sub,
      blacklisted: false,
    });
    if (!tokenDoc) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Unrecognized token');
    }
    return tokenDoc;
  }

  /**
   * Generate auth tokens
   *
   * @param {User} user The user to generate tokens for
   * @returns {Promise<Object>} The object contains the access token and the refresh token
   */
  async generateAuthTokens(user: IUser): Promise<object> {
    const accessTokenExpires = moment().add(
      config.jwt.accessExpirationMinutes,
      'minutes'
    );
    const accessToken = this.generateToken(
      user.id as string,
      accessTokenExpires,
      tokenTypes.ACCESS
    );

    const refreshTokenExpires = moment().add(
      config.jwt.refreshExpirationDays,
      'days'
    );
    const refreshToken = this.generateToken(
      user.id as string,
      refreshTokenExpires,
      tokenTypes.REFRESH
    );

    // Save new token
    await this.saveToken(
      refreshToken,
      user.id as string,
      refreshTokenExpires,
      tokenTypes.REFRESH
    );

    return {
      access: {
        token: accessToken,
        expires: accessTokenExpires.toDate(),
      },
      refresh: {
        token: refreshToken,
        expires: refreshTokenExpires.toDate(),
      },
    };
  }

  /**
   * Generate reset password token
   *
   * @param {string} email The user email to generate token for
   * @returns {Promise<string>} The reset password token
   * @throws {ApiError} If no user is found with this email
   */
  async generateResetPasswordToken(email: string): Promise<string> {
    const user = await this.userService.readOne({ email: email });
    if (!user) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'No integrated user found with this information'
      );
    }
    const expires = moment().add(
      config.jwt.resetPasswordExpirationMinutes,
      'minutes'
    );
    const resetPasswordToken = this.generateToken(
      user.id,
      expires,
      tokenTypes.RESET_PASSWORD
    );
    await this.saveToken(
      resetPasswordToken,
      user.id,
      expires,
      tokenTypes.RESET_PASSWORD
    );
    return resetPasswordToken;
  }

  /**
   * Generate verify email token
   *
   * @param {IUser} user The user to generate token for
   * @returns {Promise<string>} The verify email token
   */
  async generateVerifyEmailToken(user: IUser): Promise<string> {
    const expires = moment().add(
      config.jwt.verifyEmailExpirationMinutes,
      'minutes'
    );
    const verifyEmailToken = this.generateToken(
      user.id as string,
      expires,
      tokenTypes.VERIFY_EMAIL
    );
    await this.saveToken(
      verifyEmailToken,
      user.id as string,
      expires,
      tokenTypes.VERIFY_EMAIL
    );
    return verifyEmailToken;
  }

  /**
   * Black list a token
   *
   * @param token Token to blacklist
   * @returns {Promise<IToken | any>} The token document if it is valid
   */
  async blacklistToken(token: string): Promise<IToken | any> {
    const tokenDoc = await this.readOne({ token });

    if (tokenDoc) {
      tokenDoc.blacklisted = true;
      await tokenDoc.save();
      return tokenDoc;
    }
    // Silently fail if the token is not found
  }
}
