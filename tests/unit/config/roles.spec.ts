import { roles, roleRights } from '../../../src/config/roles';

describe('Roles', () => {
  it('should have correct roles', () => {
    expect(roles).toEqual(['user', 'admin', 'team']);
  });

  it('should have correct rights for each role', () => {
    expect(roleRights.get('user')).toEqual([]);
    expect(roleRights.get('admin')).toEqual(['getUsers', 'manageUsers']);
    expect(roleRights.get('team')).toEqual([]);
  });
});
