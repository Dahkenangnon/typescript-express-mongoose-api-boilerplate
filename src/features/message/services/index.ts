import { Service } from 'typedi';
import Message, {
  IMessage,
  IMessageMethods,
  MessageModel,
} from '../entities/message.entity';
import { BaseService } from '@/abstracts/service.base';
@Service()
export default class MessageService extends BaseService<
  IMessage,
  IMessageMethods,
  MessageModel
> {
  constructor() {
    super(Message);
  }
}
