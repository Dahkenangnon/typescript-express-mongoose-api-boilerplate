import { UserController } from '../controllers';
import UserValidation from '../validations';
import validate from '@middlewares/validate';
import express from 'express';
import auth from '@middlewares/auth';
import { BaseRoute } from '@/abstracts/route.base';
import fileUploader from '@/middlewares/uploader';

export class UserRoute extends BaseRoute<UserController> {
  constructor(app: express.Application) {
    super(app, '/v1/users', UserController);
    this.router.get(
      '',
      validate(UserValidation.readManyPaginated),
      this.controller.readManyPaginated
    );
    this.router.get(
      '/:id',
      validate(UserValidation.readOne),
      this.controller.readOne
    );
    this.router.post(
      '',
      auth(),
      validate(UserValidation.createOne),
      this.controller.createOne
    );
    this.router.patch(
      '/:id',
      auth(),
      fileUploader.uploader('users').single('avatar'),
      fileUploader.updateSingleFileField('avatar', 'users'),
      validate(UserValidation.updateOne),
      this.controller.updateOne
    );
    this.router.delete(
      '/:id',
      auth(),
      validate(UserValidation.deleteOne),
      this.controller.deleteOne
    );

    this.router.post(
      '/many',
      auth(),
      validate(UserValidation.createMany),
      this.controller.createMany
    );

    this.router.delete(
      '/many',
      auth(),
      validate(UserValidation.deleteMany),
      this.controller.deleteMany
    );

    this.router.patch(
      '/many',
      auth(),
      validate(UserValidation.updateMany),
      this.controller.updateMany
    );
  }

  public registerRoutes() {
    this.app.use(this.path, this.router);
  }
}
