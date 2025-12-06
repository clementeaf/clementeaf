import { isSuperAdmin } from '../../../config/superAdmins';

/**
 * Tests básicos para utilidades de permisos
 */

describe('isSuperAdmin', () => {
  it('debería retornar true para email de super admin', () => {
    expect(isSuperAdmin('carriagada@banados.com')).toBe(true);
    expect(isSuperAdmin('CARRIAGADA@BANADOS.COM')).toBe(true); // Case insensitive
  });

  it('debería retornar false para email normal', () => {
    expect(isSuperAdmin('user@banados.com')).toBe(false);
    expect(isSuperAdmin('admin@example.com')).toBe(false);
  });

  it('debería retornar false para valores null/undefined', () => {
    expect(isSuperAdmin(null)).toBe(false);
    expect(isSuperAdmin(undefined)).toBe(false);
    expect(isSuperAdmin('')).toBe(false);
  });
});

