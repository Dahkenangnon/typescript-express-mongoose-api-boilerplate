import { BaseValidation } from '@/abstracts/validation.base';
import Joi from 'joi';

export default class AuthValidation extends BaseValidation {
  public static login = {
    body: Joi.object().keys({
      email: Joi.string().required().email().custom(this.emailConstraint),
      password: Joi.string().required().custom(this.password),
    }),
  };
  public static register = {
    body: Joi.object().keys({
      firstName: Joi.string().custom(this.nameConstraint),
      lastName: Joi.string().custom(this.nameConstraint),
      email: Joi.string().required().email().custom(this.emailConstraint),
      password: Joi.string().required().custom(this.password),
    }),
  };

  public static logout = {
    body: Joi.object().keys({
      refreshToken: Joi.string().required().custom(this.jwt),
    }),
  };

  public static refreshTokens = {
    body: Joi.object().keys({
      refreshToken: Joi.string().required().custom(this.jwt),
    }),
  };

  public static forgotPassword = {
    body: Joi.object().keys({
      email: Joi.string().email().custom(this.emailConstraint).required(),
    }),
  };

  public static resetPassword = {
    query: Joi.object().keys({
      token: Joi.string().required().custom(this.jwt),
    }),
    body: Joi.object().keys({
      password: Joi.string().required().custom(this.password),
    }),
  };

  public static verifyEmail = {
    query: Joi.object().keys({
      token: Joi.string().required().custom(this.jwt),
    }),
  };

  public static blacklistToken = {
    body: Joi.object().keys({
      token: Joi.string().required().custom(this.jwt),
    }),
  };
}
