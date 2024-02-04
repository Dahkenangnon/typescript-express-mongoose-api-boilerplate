import express from 'express';
import AuthFeature from './auth';
import UserFeature from './user';
import MessageFeature from './message';
import Feature from '../abstracts/feature.base';
import { logger } from '@/utils/logger';
import { cronContainer } from '@/crons';
import http from 'http';

export default class Features {
  /** The express application */
  public app: express.Application;
  /** Business features container */
  public featuresLists: Feature[] = [];
  /** Http server */
  public server: http.Server | undefined;
  constructor(app: express.Application, server?: http.Server) {
    this.app = app;
    this.server = server;
    this.featuresLists.push(new AuthFeature(this.app, this.server));
    this.featuresLists.push(new UserFeature(this.app, this.server));
    this.featuresLists.push(new MessageFeature(this.app, this.server));
  }

  public init() {
    this.featuresLists.forEach((feature: Feature) => {
      feature.init();
      logger.info(`➔ #${feature?.name} Ready`);
    });
    cronContainer.start();
    logger.info('✅ All Features Bootstrapped');
  }
}
