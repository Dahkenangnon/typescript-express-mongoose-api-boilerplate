import { Schema } from 'mongoose';
import toJSON from '../../../../src/utils/mongoose/toJSON.plugin';
import mongoose from 'mongoose';

describe('toJSON plugin', () => {
  it('should transform _id to id and remove __v', () => {
    const schema = new Schema({ name: String }, { timestamps: true });
    schema.plugin(toJSON);
    const DahkenangnonModel = mongoose.model('DahkenangnonModel', schema);

    const doc = new DahkenangnonModel({ name: 'Justin' });
    const json = doc.toJSON();

    expect(json).toHaveProperty('id');
    expect(json).not.toHaveProperty('_id');
    expect(json).not.toHaveProperty('__v');
  });

  it('should remove private fields', () => {
    const schema = new Schema({
      name: String,
      secret: { type: String, private: true },
    });
    schema.plugin(toJSON);
    const FignonModel = mongoose.model('FignonModelWithPrivateField', schema);

    const doc = new FignonModel({
      name: 'Fignon Framework',
      secret: 'Fignon is the next big Php Middleware Runner you missed!',
    });
    const json = doc.toJSON();

    expect(json).toHaveProperty('id');
    expect(json).not.toHaveProperty('secret');
  });

  it('should apply original transform function', () => {
    const schema = new Schema(
      { name: String },
      {
        timestamps: true,
        toJSON: {
          transform: (_doc, ret) => {
            ret.transformed = true;
            return ret;
          },
        },
      }
    );
    schema.plugin(toJSON);
    const CotonouModelTransform = mongoose.model(
      'CotonouModelTransform',
      schema
    );

    const doc = new CotonouModelTransform({
      name: 'Cotonou is the capital of Benin Republic',
    });
    const json = doc.toJSON();

    expect(json).toHaveProperty('id');
    expect(json).toHaveProperty('transformed', true);
  });
});
