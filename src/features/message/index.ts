import Feature from '../../abstracts/feature.base';
import express from 'express';
import { MessageRoute } from './routes';
import MessageCronJobs from './crons';
import { cronContainer } from '../../crons';
import CronBase from '@/abstracts/crons.base';
import http from 'http';

export default class MessageFeature extends Feature {
  public routes: MessageRoute;
  public crons: CronBase[] = [];

  constructor(app: express.Application, server?: http.Server) {
    super(app, 'Message', 'Messaging');
    this.server = server;
    this.routes = new MessageRoute(this.app);
    this.crons = [new MessageCronJobs()];
  }

  public init(): void {
    this.routes.registerRoutes();
    this.crons.forEach((cron) => {
      cronContainer.register(cron);
    });
  }
}
