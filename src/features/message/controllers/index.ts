import { Container } from 'typedi';
import MessageService from '../services';
import {
  IMessage,
  IMessageMethods,
  MessageModel,
} from '../entities/message.entity';
import { BaseController } from '@/abstracts/controller.base';

export class MessageController extends BaseController<
  IMessage,
  IMessageMethods,
  MessageModel
> {
  constructor() {
    const filterFields = [
      'id',
      'title',
      'author',
      'createdAt',
      'updatedAt',
      'isArchived',
    ] as (keyof IMessage)[];
    const populateFields: (keyof IMessage)[] = ['author'];
    const optionsFields = ['sortBy', 'limit', 'page'];
    const updateManyFilterFields = [
      'createdAt',
      'updatedAt',
      'isArchived',
    ] as (keyof IMessage)[];
    const deleteManyFilterFields = [
      'id',
      'createdAt',
      'updatedAt',
      'isArchived',
    ] as (keyof IMessage)[];
    const service = Container.get(MessageService);
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
