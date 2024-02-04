import CronBase from '@/abstracts/crons.base';
import { logger } from '@/utils/logger';
import * as schedule from 'node-schedule';

/** Cron job decorator options */
export interface JobOptions {
  timezone?: string;
  runOnInit?: boolean;
  enabled?: boolean;
  stopOnError?: boolean;
  runOnMissed?: boolean;
  runOnComplete?: boolean;
  name?: string; // Added to identify jobs by name
}

/**
 * Schedule a cron job using a decorator
 *
 * @param cronExpression Regular cron expression
 * @param options Cron job decorator options
 * @returns The scheduled job
 */
export function Schedule(cronExpression: string, options?: JobOptions) {
  return function (_target: any, key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const name = options?.name || key; // Default to method name if no name is provided

    descriptor.value = function (...args: any[]) {
      // Create a scheduled job using the provided cron expression and options
      return CronContainer.scheduleJob(
        name,
        cronExpression,
        async () => {
          await originalMethod.apply(this, args);
        },
        options
      );
    };
    // This is used to identify scheduled methods in the cronGroup class
    descriptor.value.isScheduled = true;
  };
}

/**
 * Cron Job Manager using `node-schedule` module
 * To use other cron module, just update the CronContainer.scheduleJob method
 */
export class CronContainer {
  private static instance: CronContainer;
  static getInstance() {
    if (
      CronContainer.instance === undefined ||
      CronContainer.instance === null
    ) {
      CronContainer.instance = new CronContainer();
    }
    return CronContainer.instance;
  }

  /** Hold all cron jobs. Cron jobs are class schedule methods */
  static jobs: Record<string, schedule.Job> = {};
  /** Hold all canceled cron jobs. */
  static canceledJobs: Record<string, schedule.Job> = {};
  /** Hold cron job group name. Here group are classes which methods can be scheduled */
  private cronChildren: CronBase[] = [];

  /**
   * Register a cron job group class
   * @param cronGroup A cron job group class
   * @returns void
   */
  public register(cronGroup: CronBase) {
    // Execute the beforeRegister method of the cronGroup
    if (
      cronGroup.beforeRegister &&
      typeof cronGroup.beforeRegister === 'function'
    ) {
      cronGroup.beforeRegister();
    }
    this.cronChildren.push(cronGroup);

    // Execute the afterRegister method of the cronGroup
    if (
      cronGroup.afterRegister &&
      typeof cronGroup.afterRegister === 'function'
    ) {
      cronGroup.afterRegister();
    }
  }

  /**
   * Unregister a cron job group class
   *
   * @param cronGroup A cron job group class
   * @returns void
   */
  public unRegister(cronGroup: CronBase) {
    const index = this.cronChildren.indexOf(cronGroup);
    if (index !== -1) {
      // Execute the beforeUnregister method of the cronGroup
      if (
        cronGroup.beforeUnregister &&
        typeof cronGroup.beforeUnregister === 'function'
      ) {
        cronGroup.beforeUnregister();
      }
      this.cronChildren.splice(index, 1);
      // Execute the afterUnregister method of the cronGroup
      if (
        cronGroup.afterUnregister &&
        typeof cronGroup.afterUnregister === 'function'
      ) {
        cronGroup.afterUnregister();
      }
    }
  }

  /**
   * Start all cron jobs registered
   *
   * This should be called after all cron jobs are registered and only once on application startup
   */
  public start() {
    this.cronChildren.forEach((cronGroup) => {
      const methods = Object.getOwnPropertyNames(
        Object.getPrototypeOf(cronGroup)
      );
      let i = 0;
      const n = methods.length;
      methods.forEach((method) => {
        const fn = cronGroup[method];
        if (typeof fn === 'function' && fn?.isScheduled) {
          // Execute the beforeStart first method of the cronGroup
          if (
            i === 0 &&
            cronGroup.beforeStart &&
            typeof cronGroup.beforeStart === 'function'
          ) {
            cronGroup.beforeStart();
          }

          // Execute the scheduled method
          fn.call(cronGroup);

          // Execute the afterStart last method of the cronGroup
          if (
            i === n - 1 &&
            cronGroup.afterStart &&
            typeof cronGroup.afterStart === 'function'
          ) {
            cronGroup.afterStart();
          }
          i++;
        }
      });
    });
    logger.info(
      `CronContainer started with: ${CronContainer.getRunningJobCount()} running jobs which are: ${CronContainer.getAllJobNames().join(
        ', '
      )}`
    );
  }

  /**
   * Schedule a cron job using `node-schedule` module and store it in the jobs list
   *
   * When needed to change cron module, this is the only method to change
   * @see https://www.npmjs.com/package/node-schedule
   * @param name The name of the scheduled job
   * @param cronExpression Regular cron expression
   * @param callback Callback function which will be executed on the scheduled time
   * @param options Cron job decorator options
   * @returns The scheduled job
   */
  static scheduleJob(
    name: string,
    cronExpression: string,
    callback: (...args: any[]) => Promise<void>,
    options?: JobOptions
  ) {
    const job = schedule.scheduleJob(cronExpression, async () => {
      try {
        await callback();
      } catch (error) {
        console.error(`Error executing scheduled task [${name}]:`, error);
        if (options?.stopOnError) {
          job.cancel();
        }
      }
    });

    if (options?.runOnInit) {
      job.invoke();
    }

    this.jobs[name] = job;

    return job;
  }

  // Below methods have to be reviewed

  /**
   * Get a scheduled job by name
   *
   * @param name The name of the scheduled job
   * @returns The scheduled job
   */
  static getJob(name: string) {
    return this.jobs[name] || null;
  }

  /**
   * Cancel a scheduled job by name and remove it from the jobs list
   *
   * @param name The name of the scheduled job
   */
  static cancelJob(name: string) {
    const job = this.jobs[name] || null;
    if (job) {
      job.cancel();
      delete this.jobs[name];
    }
  }

  /**
   * Cancel all scheduled jobs and remove them from the jobs list
   *
   * @returns void
   */
  static cancelAllJobs() {
    for (const name in Object.keys(this.jobs)) {
      this.cancelJob(name);
    }
  }

  /**
   * Reschedule a scheduled job by name
   *
   * Change the scheduled time/infos of a job
   *
   * @param name The name of the scheduled job
   * @param cronExpression Regular cron expression
   * @returns True if the job was rescheduled, false otherwise
   */
  static rescheduleJob(name: string, cronExpression: string) {
    const job = this.jobs[name];
    if (job) {
      return job.reschedule(cronExpression);
    }
    return false;
  }

  /**
   * Reschedule all scheduled jobs
   *
   * Change the scheduled time/infos of all jobs
   *
   * @param cronExpression Regular cron expression
   * @returns An array of True/False values if the job was rescheduled or not
   * @see rescheduleJob
   */
  static rescheduleAllJobs(cronExpression: string) {
    const rescheduled = [];
    for (const name in Object.keys(this.jobs)) {
      rescheduled.push(this.rescheduleJob(name, cronExpression));
    }
    return rescheduled;
  }

  /**
   * Get the number of scheduled jobs
   *
   * @returns The number of scheduled jobs
   */
  static getRunningJobCount(): number {
    return Object.values(this.jobs).filter(
      (job) => job.nextInvocation() !== null
    ).length;
  }

  /**
   * Get the list of scheduled jobs
   *
   * @returns An array of scheduled jobs
   */
  static getRunningJobs() {
    return Object.values(this.jobs).filter(
      (job) => job.nextInvocation() !== null
    );
  }

  /**
   * Get the list of scheduled jobs names
   *
   * @returns An array of scheduled jobs names
   */
  static getAllJobs() {
    return Object.values(this.jobs);
  }

  /**
   * Get the list of scheduled jobs names
   *
   * @returns An array of scheduled jobs names
   */
  static getAllJobNames() {
    return Object.keys(this.jobs);
  }

  /**
   * Start a scheduled job by name
   *
   * @param name The name of the scheduled job
   * @returns void
   * @see invoke
   */
  static startAllJobs() {
    for (const name in Object.keys(this.jobs)) {
      const job = this.jobs[name];
      job.invoke();
    }
  }
}

export const cronContainer = CronContainer.getInstance();
