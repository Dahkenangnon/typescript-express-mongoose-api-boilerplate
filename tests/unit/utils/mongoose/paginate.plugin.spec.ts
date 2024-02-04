import { Schema, model, connect, disconnect, ConnectOptions } from 'mongoose';
import paginate from '../../../../src/utils/mongoose/paginate.plugin';
import config from '../../../../src/config';
import mongoose from 'mongoose';

describe('paginate plugin', () => {
  beforeAll(async () => {
    await connect(config.db.uri, config.db.options as ConnectOptions);
  });

  afterAll(async () => {
    // Remove all the data for all db collections
    const { collections } = mongoose.connection;
    const collectionKeys = Object.keys(collections);

    await Promise.all(
      collectionKeys.map(async (key) => {
        await collections[key].deleteMany({});
      })
    );

    // Remove teh "users" collection from the db
    await mongoose.connection.dropCollection('users');

    await disconnect();
  });

  it('should return paginated results', async () => {
    const userSchema = new Schema({ name: String }, { timestamps: true });
    userSchema.plugin(paginate);

    const User = model('User', userSchema);

    await User.create([
      { name: 'User 1' },
      { name: 'User 2' },
      { name: 'User 3' },
      { name: 'User 4' },
    ]);

    const { results, totalPages, totalResults } = await (User as any).paginate(
      {},
      { limit: 2, page: 1 }
    );

    expect(results.length).toEqual(2);
    expect(totalPages).toEqual(2);
    expect(totalResults).toEqual(4);
  });
});
