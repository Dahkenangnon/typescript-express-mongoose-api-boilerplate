import { Service } from 'typedi';
import User, { IUser, IUserMethods, UserModel } from '../entities/user.entity';
import { BaseService } from '@/abstracts/service.base';
@Service()
export default class UserService extends BaseService<
  IUser,
  IUserMethods,
  UserModel
> {
  constructor() {
    super(User);
  }
}
