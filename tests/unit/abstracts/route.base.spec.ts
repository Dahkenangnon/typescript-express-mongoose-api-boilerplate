import express from 'express';
import { BaseController } from '../../../src/abstracts/controller.base';
import { BaseRoute } from '../../../src/abstracts/route.base';

class TestController extends BaseController<any, any, any> {
  //
}

class TestRoute extends BaseRoute<TestController> {
  public registerRoutes() {
    //
    this.router.get('/path/to/any', (_req, _res, _next) => {
      //
    });
  }
}

describe('BaseRoute', () => {
  let app: express.Application;
  let testRoute: TestRoute;

  beforeEach(() => {
    app = express();
    testRoute = new TestRoute(app, '/test', TestController);
  });

  it('should initialize properties correctly', () => {
    expect(testRoute.app).toBe(app);
    expect(testRoute.path).toBe('/test');
    expect(testRoute.router).toBeDefined();
    expect(testRoute.router.get).toBeDefined();
    expect(testRoute.router.post).toBeDefined();
    expect(testRoute.controller).toBeInstanceOf(TestController);
  });

  it('should call registerRoutes method', () => {
    jest.spyOn(testRoute, 'registerRoutes');
    testRoute.registerRoutes();
    expect(testRoute.registerRoutes).toHaveBeenCalled();
  });

  it('should register routes', () => {
    testRoute.registerRoutes();
    expect(testRoute.router.stack).toHaveLength(1);
  });
});
