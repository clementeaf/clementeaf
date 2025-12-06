import { AppDataSource } from '../config/database';
import { Warehouse } from '../modules/Products/entities/Warehouse.entity';
import { initializeDatabase } from '../config/database';

/**
 * Script de seed para crear bodegas iniciales
 * Ejecutar con: npm run seed:warehouses
 * O desde el endpoint: POST /migrations/seed-warehouses
 */
async function seedWarehouses(): Promise<void> {
  try {
    console.log('🌱 Iniciando seed de bodegas...');
    
    await initializeDatabase();
    
    const warehouseRepository = AppDataSource.getRepository(Warehouse);
    
    // Bodegas iniciales
    const warehouses = [
      {
        codigo: 'STGO',
        nombre: 'Santiago',
        codigoCorto: 'STGO',
        direccion: 'Santiago, Chile',
        ciudad: 'Santiago',
        activo: true
      },
      {
        codigo: 'VALPO',
        nombre: 'Valparaíso',
        codigoCorto: 'VALPO',
        direccion: 'Valparaíso, Chile',
        ciudad: 'Valparaíso',
        activo: true
      },
      {
        codigo: 'CONCE',
        nombre: 'Concepción',
        codigoCorto: 'CONCE',
        direccion: 'Concepción, Chile',
        ciudad: 'Concepción',
        activo: true
      }
    ];

    let created = 0;
    let updated = 0;

    for (const warehouseData of warehouses) {
      const existingWarehouse = await warehouseRepository.findOne({
        where: { codigo: warehouseData.codigo }
      });

      if (existingWarehouse) {
        // Actualizar bodega existente
        Object.assign(existingWarehouse, warehouseData);
        await warehouseRepository.save(existingWarehouse);
        updated++;
        console.log(`✅ Bodega actualizada: ${warehouseData.codigo} - ${warehouseData.nombre}`);
      } else {
        // Crear nueva bodega
        const warehouse = warehouseRepository.create(warehouseData);
        await warehouseRepository.save(warehouse);
        created++;
        console.log(`✨ Bodega creada: ${warehouseData.codigo} - ${warehouseData.nombre}`);
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   - Bodegas creadas: ${created}`);
    console.log(`   - Bodegas actualizadas: ${updated}`);
    console.log(`   - Total procesadas: ${warehouses.length}`);
    console.log('\n✅ Seed de bodegas completado exitosamente');
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error en seed de bodegas:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedWarehouses()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedWarehouses };

