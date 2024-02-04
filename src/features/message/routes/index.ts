import { MessageController } from '../controllers';
import MessageValidation from '../validations';
import validate from '@middlewares/validate';
import express from 'express';
import auth from '@middlewares/auth';
import { BaseRoute } from '@/abstracts/route.base';

export class MessageRoute extends BaseRoute<MessageController> {
  constructor(app: express.Application) {
    super(app, '/v1/messages', MessageController);
    this.router.get(
      '',
      auth(),
      validate(MessageValidation.readManyPaginated),
      this.controller.readManyPaginated
    );
    this.router.get(
      '/:id',
      auth(),
      validate(MessageValidation.readOne),
      this.controller.readOne
    );
    this.router.post(
      '',
      auth(),
      validate(MessageValidation.createOne),
      this.controller.createOne
    );
    this.router.patch(
      '/:id',
      auth(),
      validate(MessageValidation.updateOne),
      this.controller.updateOne
    );
    this.router.delete(
      '/:id',
      auth(),
      validate(MessageValidation.deleteOne),
      this.controller.deleteOne
    );

    this.router.post(
      '/many',
      auth(),
      validate(MessageValidation.createMany),
      this.controller.createMany
    );

    this.router.delete(
      '/many',
      auth(),
      validate(MessageValidation.deleteMany),
      this.controller.deleteMany
    );

    this.router.patch(
      '/many',
      auth(),
      validate(MessageValidation.updateMany),
      this.controller.updateMany
    );
  }

  public registerRoutes() {
    this.app.use(this.path, this.router);
  }
}
