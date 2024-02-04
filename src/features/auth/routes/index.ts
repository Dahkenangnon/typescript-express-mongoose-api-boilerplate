import AuthController from '../controllers';
import express from 'express';
import AuthValidation from '../validations';
import validate from '@middlewares/validate';
import { BaseRoute } from '@/abstracts/route.base';

export class AuthRoute extends BaseRoute<AuthController> {
  constructor(app: express.Application) {
    super(app, '/v1/auth', AuthController);
    this.router.post(
      '/register',
      validate(AuthValidation.register),
      this.controller.register
    );
    this.router.post(
      '/login',
      validate(AuthValidation.login),
      this.controller.login
    );
    this.router.post(
      '/logout',
      validate(AuthValidation.logout),
      this.controller.logout
    );
    this.router.post(
      '/refresh-tokens',
      validate(AuthValidation.refreshTokens),
      this.controller.refreshTokens
    );
    this.router.post(
      '/forgot-password',
      validate(AuthValidation.forgotPassword),
      this.controller.forgotPassword
    );
    this.router.post(
      '/reset-password',
      validate(AuthValidation.resetPassword),
      this.controller.resetPassword
    );
    this.router.post(
      '/verify-email',
      validate(AuthValidation.verifyEmail),
      this.controller.verifyEmail
    );
    this.router.post(
      '/blacklist-token',
      validate(AuthValidation.blacklistToken),
      this.controller.blacklistToken
    );
  }

  public registerRoutes() {
    this.app.use(this.path, this.router);
  }
}
