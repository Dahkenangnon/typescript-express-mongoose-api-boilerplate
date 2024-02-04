import { Router } from 'express';
import express from 'express';
import { BaseController } from './controller.base';

/**
 * Base class for routes
 */
export abstract class BaseRoute<T extends BaseController<any, any, any>> {
  /** Base route for this feature route */
  public path: string;
  /** Express router */
  public router: Router;
  /** Express application */
  public app: express.Application;
  /** Controller for this feature route */
  public controller: T;

  constructor(app: express.Application, path: string, Controller: any) {
    this.app = app;
    this.path = path;
    this.router = Router();
    this.controller = new Controller() as T;
  }

  public abstract registerRoutes(): void;
}
