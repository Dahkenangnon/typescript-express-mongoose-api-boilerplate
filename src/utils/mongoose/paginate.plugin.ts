import { Schema, Query, Document } from 'mongoose';

interface PaginateOptions {
  sortBy?: string;
  populate?: string;
  limit?: number;
  page?: number;
}

interface PaginateResult<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

const paginate = (schema: Schema<any>): void => {
  schema.statics.paginate = async function (
    filter: any,
    options: PaginateOptions = {}
  ): Promise<PaginateResult<Document>> {
    let sort = '';
    if (options.sortBy) {
      const sortingCriteria: string[] = [];
      options.sortBy.split(',').forEach((sortOption: string) => {
        const [key, order] = sortOption.split(':');
        sortingCriteria.push((order === 'desc' ? '-' : '') + key);
      });
      sort = sortingCriteria.join(' ');
    } else {
      sort = 'createdAt';
    }

    const limit =
      options.limit && parseInt(String(options.limit), 10) > 0
        ? parseInt(String(options.limit), 10)
        : 10;
    const page =
      options.page && parseInt(String(options.page), 10) > 0
        ? parseInt(String(options.page), 10)
        : 1;
    const skip = (page - 1) * limit;

    const countPromise = this.countDocuments(filter).exec();
    let docsPromise: Query<Document[], Document> = this.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    if (options.populate) {
      const populateFields = options.populate.split(',');
      populateFields.forEach((field) => {
        docsPromise = docsPromise.populate(field);
      });
    }

    const docs = await docsPromise.exec();

    return Promise.all([countPromise, docs]).then((values) => {
      const [totalResults, results] = values;
      const totalPages = Math.ceil(totalResults / limit);
      const result = {
        results,
        page,
        limit,
        totalPages,
        totalResults,
      };
      return Promise.resolve(result);
    });
  };
};

export default paginate;
