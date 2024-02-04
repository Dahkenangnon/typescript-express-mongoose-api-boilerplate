/**
 * Cron job base class
 */
export default abstract class CronBase {
  [key: string]: Function | any | undefined;
  /** The cron job group name */
  static cronGroupName: string;
  /** Called before the cron class is registered */
  beforeRegister(): void | Promise<void> {
    return;
  }
  /** Called after the cron class is registered */
  afterRegister(): void | Promise<void> {
    return;
  }
  /** Called before the cron class is unregistered */
  beforeUnregister(): void | Promise<void> {
    return;
  }
  /** Called after the cron class is unregistered */
  afterUnregister(): void | Promise<void> {
    return;
  }
  /** Called before the first methods of the cron class is started */
  beforeStart(): void | Promise<void> {
    return;
  }
  /** Called after the last methods of the cron class is started */
  afterStart(): void | Promise<void> {
    return;
  }
  /** Called before the first methods of the cron class is stopped */
  beforeStop(): void | Promise<void> {
    return;
  }
  /** Called after the last methods of the  cron class is stopped */
  afterStop(): void | Promise<void> {
    return;
  }
}
