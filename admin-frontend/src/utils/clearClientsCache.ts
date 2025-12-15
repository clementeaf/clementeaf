/**
 * Utilidad para limpiar el caché de clientes del sessionStorage
 * Útil cuando hay inconsistencias entre datos persistidos y la API
 */
export const clearClientsCache = (): void => {
  try {
    // Limpiar todas las claves relacionadas con clientes
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('clients_data_')) {
        sessionStorage.removeItem(key);
        console.log('Eliminado del caché:', key);
      }
    });
    console.log('✅ Caché de clientes limpiado');
  } catch (error) {
    console.error('Error al limpiar caché de clientes:', error);
  }
};

