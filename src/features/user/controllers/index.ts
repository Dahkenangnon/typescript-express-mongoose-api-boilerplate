import { Container } from 'typedi';
import UserService from '../services';
import { IUser, IUserMethods, UserModel } from '../entities/user.entity';
import { BaseController } from '@/abstracts/controller.base';

export class UserController extends BaseController<
  IUser,
  IUserMethods,
  UserModel
> {
  constructor() {
    const filterFields = [
      'id',
      'email',
      'createdAt',
      'updatedAt',
    ] as (keyof IUser)[];
    const populateFields = [] as (keyof IUser)[];
    const optionsFields = ['sortBy', 'limit', 'page'];
    const updateManyFilterFields = [
      'id',
      'createdAt',
      'updatedAt',
    ] as (keyof IUser)[];
    const deleteManyFilterFields = [
      'id',
      'createdAt',
      'updatedAt',
    ] as (keyof IUser)[];
    const service = Container.get(UserService);
    super(
      service,
      filterFields,
      optionsFields,
      populateFields,
      updateManyFilterFields,
      deleteManyFilterFields
    );
  }
}
