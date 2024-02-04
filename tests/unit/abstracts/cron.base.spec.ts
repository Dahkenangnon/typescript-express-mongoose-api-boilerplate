import CronBase from '../../../src/abstracts/crons.base';

class TestCron extends CronBase {
  static cronGroupName = 'test';
}

describe('CronBase', () => {
  let testCron: TestCron;

  beforeEach(() => {
    testCron = new TestCron();
    jest.spyOn(testCron, 'beforeRegister');
    jest.spyOn(testCron, 'afterRegister');
    jest.spyOn(testCron, 'beforeUnregister');
    jest.spyOn(testCron, 'afterUnregister');
    jest.spyOn(testCron, 'beforeStart');
    jest.spyOn(testCron, 'afterStart');
    jest.spyOn(testCron, 'beforeStop');
    jest.spyOn(testCron, 'afterStop');
  });

  it('should call lifecycle methods', async () => {
    await testCron.beforeRegister();
    expect(testCron.beforeRegister).toHaveBeenCalled();

    await testCron.afterRegister();
    expect(testCron.afterRegister).toHaveBeenCalled();

    await testCron.beforeUnregister();
    expect(testCron.beforeUnregister).toHaveBeenCalled();

    await testCron.afterUnregister();
    expect(testCron.afterUnregister).toHaveBeenCalled();

    await testCron.beforeStart();
    expect(testCron.beforeStart).toHaveBeenCalled();

    await testCron.afterStart();
    expect(testCron.afterStart).toHaveBeenCalled();

    await testCron.beforeStop();
    expect(testCron.beforeStop).toHaveBeenCalled();

    await testCron.afterStop();
    expect(testCron.afterStop).toHaveBeenCalled();
  });
});
