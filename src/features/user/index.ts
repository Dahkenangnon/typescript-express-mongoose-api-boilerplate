import Feature from '../../abstracts/feature.base';
import express from 'express';
import { UserRoute } from './routes';
import UserCronJobs from './crons';
import CronBase from '@/abstracts/crons.base';
import { cronContainer } from '../../crons';
import http from 'http';

export default class UserFeature extends Feature {
  public routes: UserRoute;
  public crons: CronBase[] = [];
  constructor(app: express.Application, server?: http.Server) {
    super(app, 'User', 'User management');
    this.server = server;
    this.routes = new UserRoute(this.app);
    this.crons = [new UserCronJobs()];
  }

  public init(): void {
    this.routes.registerRoutes();
    this.crons.forEach((cron) => {
      cronContainer.register(cron);
    });
  }
}
