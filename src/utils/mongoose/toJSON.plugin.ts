import { Schema } from 'mongoose';

type TransformFunction = (doc: any, ret: any, options: any) => any;

const deleteAtPath = (obj: any, path: string[], index: number): void => {
  if (index === path.length - 1) {
    delete obj[path[index]];
    return;
  }
  if (obj[path[index]]) {
    deleteAtPath(obj[path[index]], path, index + 1);
  }
};

const toJSON = (schema: Schema<any>): void => {
  let transform: TransformFunction | undefined;
  if (
    (schema as any).options.toJSON &&
    (schema as any).options.toJSON.transform
  ) {
    transform = (schema as any).options.toJSON.transform;
  }

  (schema as any).options.toJSON = Object.assign(
    (schema as any).options.toJSON || {},
    {
      transform(doc: any, ret: { [key: string]: any }, options: any) {
        Object.keys(schema.paths).forEach((path) => {
          const schemaPath = schema.paths[path];
          if (schemaPath.options && schemaPath.options.private) {
            deleteAtPath(ret, path.split('.'), 0);
          }
        });

        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        //delete ret.createdAt;
        //delete ret.updatedAt;
        if (transform) {
          return transform(doc, ret, options);
        }
      },
    }
  );
};

export default toJSON;
