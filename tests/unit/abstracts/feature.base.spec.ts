import express from 'express';
import Feature from '../../../src/abstracts/feature.base';

class TestFeature extends Feature {
  public init() {
    //
  }
}

describe('Feature', () => {
  let app: express.Application;
  let testFeature: TestFeature;

  beforeEach(() => {
    app = express();
    testFeature = new TestFeature(app, 'TestFeature', 'This is a test feature');
  });

  it('should initialize properties correctly', () => {
    expect(testFeature.app).toBe(app);
    expect(testFeature.name).toBe('TestFeature');
    expect(testFeature.description).toBe('This is a test feature');
    expect(testFeature.crons).toEqual([]);
  });

  it('should use constructor name as default name', () => {
    const feature = new TestFeature(app);
    expect(feature.name).toBe('TestFeature');
  });

  it('should use name as default description', () => {
    const feature = new TestFeature(app, 'TestFeature');
    expect(feature.description).toBe('TestFeature');
  });

  it('should call init method', () => {
    jest.spyOn(testFeature, 'init');
    testFeature.init();
    expect(testFeature.init).toHaveBeenCalled();
  });
});
