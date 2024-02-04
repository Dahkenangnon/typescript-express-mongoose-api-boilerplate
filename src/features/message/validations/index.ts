import { BaseValidation } from '@/abstracts/validation.base';
import Joi from 'joi';

export default class MessageValidation extends BaseValidation {
  public static createOne = {
    body: Joi.object().keys({
      title: Joi.string().required(),
      content: Joi.string().required(),
      thumbnail: Joi.any(),
      isArchived: Joi.boolean(),
      author: Joi.string().required().custom(this.rowId),

      /** Our multer middleware automatically add {fileField}_metadata
       * to the req body to allow controller access uploaded files infos
       *
       * e.g: thumbnail_metadata: { fieldname: 'thumbnail', originalname: 'image.png', encoding: '7bit', mimetype: 'image/png', destination: 'uploads/', filename: 'image-1619119857878.png', path: 'uploads/image-1619119857878.png', size: 1024 }
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
        title: Joi.string(),
        content: Joi.string(),
        author: Joi.string().custom(this.rowId),
        thumbnail: Joi.any(),
        isArchived: Joi.boolean(),
        '*_metadata': Joi.object().pattern(
          /.*/,
          Joi.object().pattern(/.*/, Joi.any())
        ),
      })
      .min(1),
  };

  public static readManyPaginated = {
    query: Joi.object().keys({
      title: Joi.string(),
      author: Joi.string().custom(this.rowId),
      isArchived: Joi.boolean(),
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
        ),
        author: Joi.string().custom(this.rowId),
        isArchived: Joi.boolean(),
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
        ),
        author: Joi.string().custom(this.rowId),
        isArchived: Joi.boolean(),
        createdAt: Joi.date(),
        updatedAt: Joi.date(),
      })
      .min(1),
  };
}
