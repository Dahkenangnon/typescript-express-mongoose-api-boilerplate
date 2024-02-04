import { Config } from '../../../src/config';

describe('Config class', () => {
  let config: Config;

  beforeAll(() => {
    config = Config.getInstance();
  });

  test('should create a singleton instance', () => {
    const anotherConfigInstance = Config.getInstance();
    expect(anotherConfigInstance).toBe(config);
  });

  test('should correctly set environment variables', () => {
    expect(config.isEnvSetAndValid).toBe(true);
  });

  test('should correctly set environment variables', () => {
    expect(config.env).toBe('test');
  });
});
