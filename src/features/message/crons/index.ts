import CronBase from '@/abstracts/crons.base';
import { Schedule } from '@/crons';

export default class MessageCronJobs extends CronBase {
  public name = 'MessageCronJobs';

  @Schedule('*/5 * * * *', {
    runOnInit: true,
    stopOnError: true,
    name: 'message-sample',
  })
  public async sample() {
    console.log(
      "MessageCronJobs - sample: I'll run every 5 minutes. See you soon!"
    );
  }
}
