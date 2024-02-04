import CronBase from '@/abstracts/crons.base';
import { Schedule } from '@/crons';

export default class AuthCronJobs extends CronBase {
  public name = 'AuthCronJobs';

  @Schedule('* * * * *', {
    runOnInit: true,
    stopOnError: true,
    name: 'auth-sample',
  })
  public async sample() {
    console.log("AuthCronJobs - sample: I'll run every minute. See you soon!");
  }
}
