import { tokenTypes } from '../../../src/config/tokens';

describe('Token Types', () => {
  it('should have correct token types', () => {
    expect(tokenTypes).toEqual({
      ACCESS: 'access',
      REFRESH: 'refresh',
      RESET_PASSWORD: 'resetPassword',
      VERIFY_EMAIL: 'verifyEmail',
    });
  });
});
