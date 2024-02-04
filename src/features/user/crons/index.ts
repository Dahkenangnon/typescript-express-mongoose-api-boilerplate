import CronBase from '@/abstracts/crons.base';
import { Schedule } from '@/crons';

export default class UserCronJobs extends CronBase {
  public name = 'UserCronJobs';

  @Schedule('*/10 * * * *', {
    runOnInit: false,
    stopOnError: false,
    name: 'user-sample',
  })
  public async sample() {
    console.log(
      "UserCronJobs - sample: I'll run every 10 minutes. See you soon!"
    );
  }
}
