import Feature from '../../abstracts/feature.base';
import AuthCronJobs from './crons';
import { AuthRoute } from './routes';
import express from 'express';
import { cronContainer } from '../../crons';
import http from 'http';

export default class AuthFeature extends Feature {
  public routes: AuthRoute;
  public crons: AuthCronJobs[];

  constructor(app: express.Application, server?: http.Server) {
    super(app, 'Auth', 'User authentication');
    this.server = server;
    this.routes = new AuthRoute(this.app);
    this.crons = [new AuthCronJobs()];
  }

  public init(): void {
    this.routes.registerRoutes();
    this.crons.forEach((cron) => {
      cronContainer.register(cron);
    });
  }
}
