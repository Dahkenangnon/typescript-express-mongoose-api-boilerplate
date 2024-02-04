import express from 'express';
import CronBase from './crons.base';
import http from 'http';

export default abstract class Feature {
  /** Express application */
  public app: express.Application;
  /** Name of the feature */
  public name?: string;
  /** Description of the feature */
  public description?: string;
  /** List of cron jobs defined in this feature*/
  public crons: CronBase[] = [];
  public routes: any;
  public server?: http.Server;

  constructor(app: express.Application, name?: string, description?: string) {
    this.app = app;
    this.name = name || this.constructor.name;
    this.description = description || this.name;
  }

  public abstract init(): void;
}
