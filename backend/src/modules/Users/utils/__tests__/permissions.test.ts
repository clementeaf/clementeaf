/**
 * Tests básicos para utilidades de permisos
 * 
 * NOTA: Estos tests requieren configuración de Jest/Vitest
 * Para ejecutar, instalar dependencias de testing:
 * npm install --save-dev jest @types/jest ts-jest
 * 
 * O usar Vitest:
 * npm install --save-dev vitest @vitest/ui
 */

import { isSuperAdmin } from '../../../config/superAdmins';

// Tests comentados hasta configurar framework de testing
/*
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
*/

// Verificación manual básica (para desarrollo)
if (process.env.NODE_ENV === 'development') {
  console.log('🧪 Verificación manual de isSuperAdmin:');
  console.log('  carriagada@banados.com:', isSuperAdmin('carriagada@banados.com')); // true
  console.log('  user@banados.com:', isSuperAdmin('user@banados.com')); // false
  console.log('  null:', isSuperAdmin(null)); // false
}

