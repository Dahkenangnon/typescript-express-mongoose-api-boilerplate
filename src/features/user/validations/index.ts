import { BaseValidation } from '@/abstracts/validation.base';
import Joi from 'joi';

export default class UserValidation extends BaseValidation {
  public static createOne = {
    body: Joi.object().keys({
      avatar: Joi.any(),
      firstName: Joi.string().required().custom(this.nameConstraint),
      lastName: Joi.string().required().custom(this.nameConstraint),
      email: Joi.string().required().email().custom(this.emailConstraint),
      password: Joi.string().required().custom(this.password),

      /** Our multer middleware automatically add {fileField}_metadata
       * to the req body to allow controller access uploaded files infos
       *
       * e.g: avatar_metadata: { fieldname: 'avatar', originalname: 'image.png', encoding: '7bit', mimetype: 'image/png', destination: 'uploads/', filename: 'image-1619119857878.png', path: 'uploads/image-1619119857878.png', size: 1024 }
       * */
      '*_metadata': Joi.object().pattern(
        /.*/,
        Joi.object().pattern(/.*/, Joi.any())
      ),
    }),
  };

  public static updateOne = {
    params: Joi.object().keys({
      id: Joi.string().required().custom(this.rowId),
    }),
    body: Joi.object()
      .keys({
        firstName: Joi.string().custom(this.nameConstraint),
        lastName: Joi.string().custom(this.nameConstraint),
        password: Joi.string().custom(this.password),
        isEmailVerified: Joi.boolean(),
        avatar: Joi.any(),
        '*_metadata': Joi.object().pattern(
          /.*/,
          Joi.object().pattern(/.*/, Joi.any())
        ),
      })
      .min(1),
  };

  public static readManyPaginated = {
    query: Joi.object().keys({
      email: Joi.string().custom(this.emailConstraint),
      createdAt: Joi.date(),
      updatedAt: Joi.date(),
      limit: Joi.number().integer(),
      page: Joi.number().integer(),
      sortBy: Joi.string(),
    }),
  };

  public static readOne = {
    params: Joi.object().keys({
      id: Joi.string().required().custom(this.rowId),
    }),
  };

  public static deleteOne = {
    params: Joi.object().keys({
      id: Joi.string().required().custom(this.rowId),
    }),
  };

  public static createMany = {
    body: Joi.array().items(this.createOne.body),
  };

  public static updateMany = {
    query: Joi.object()
      .keys({
        id: Joi.alternatives().try(
          Joi.string().custom(this.rowId),
          Joi.array().items(Joi.string().custom(this.rowId)).min(1).max(100)
        ), // Ensure that the array is not too big to avoid performance issues or abuse
        email: Joi.string().custom(this.emailConstraint),
        isEmailVerified: Joi.boolean(),
        createdAt: Joi.date(),
        updatedAt: Joi.date(),
      })
      .min(1),
    body: this.updateOne.body,
  };

  public static deleteMany = {
    query: Joi.object()
      .keys({
        id: Joi.alternatives().try(
          Joi.string().custom(this.rowId),
          Joi.array().items(Joi.string().custom(this.rowId)).min(1).max(100)
        ), // Ensure that the array is not too big to avoid performance issues or abuse
        email: Joi.string().custom(this.emailConstraint),
        isEmailVerified: Joi.boolean(),
        createdAt: Joi.date(),
        updatedAt: Joi.date(),
      })
      .min(1),
  };
}
