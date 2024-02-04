import { BaseValidation } from '../../../src/abstracts/validation.base';
import _jwt from 'jsonwebtoken';
import _config from '../../../src/config';

jest.mock('../../../src/config', () => ({
  jwt: {
    password: {
      min: 8,
      max: 20,
    },
    username: {
      min: 30,
      max: 50,
    },
    userFullname: {
      max: 70,
    },
    email: {
      min: 5,
      max: 90,
    },
  },
}));
jest.mock('jsonwebtoken', () => ({
  decode: jest.fn(),
}));

const helpers = {
  message: jest.fn(),
};

describe('BaseValidation', () => {
  it('should validate rowId', () => {
    BaseValidation.rowId('60d6c7f9f9c3a6d327a4f6b2', helpers);
    expect(helpers.message).not.toHaveBeenCalled();

    BaseValidation.rowId('invalidRowId', helpers);
    expect(helpers.message).toHaveBeenCalledWith('Invalid object id');
  });
});
