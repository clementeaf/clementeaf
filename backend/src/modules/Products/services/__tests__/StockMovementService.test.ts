/**
 * Tests básicos para StockMovementService
 * 
 * NOTA: Estos tests requieren configuración de Jest/Vitest y base de datos
 * Para ejecutar, instalar dependencias de testing:
 * npm install --save-dev jest @types/jest ts-jest
 * 
 * Tests comentados hasta configurar framework de testing
 */

/*
import { StockMovementService } from '../StockMovementService';
import { MovementType } from '../../entities/StockMovement.entity';
import type { CreateMovementDto } from '../../dto/CreateMovementDto';

describe('StockMovementService', () => {
  let service: StockMovementService;

  beforeEach(() => {
    service = new StockMovementService();
  });

  describe('getCurrentStock', () => {
    it('debería retornar 0 si no hay movimientos', async () => {
      const stock = await service.getCurrentStock('PROD001', 1);
      expect(stock).toBe(0);
    });
  });

  describe('createMovement', () => {
    it('debería lanzar error si no hay stock suficiente para salida', async () => {
      const dto: CreateMovementDto = {
        productId: 'PROD001',
        productCode: 'PROD001',
        productName: 'Producto Test',
        warehouseId: 1,
        type: MovementType.SALIDA,
        cantidad: 1000 // Más de lo disponible
      };
      await expect(service.createMovement(dto)).rejects.toThrow('Stock insuficiente');
    });

    it('debería crear entrada correctamente', async () => {
      const dto: CreateMovementDto = {
        productId: 'PROD001',
        productCode: 'PROD001',
        productName: 'Producto Test',
        warehouseId: 1,
        type: MovementType.ENTRADA,
        cantidad: 100
      };
      const movement = await service.createMovement(dto);
      expect(movement.type).toBe(MovementType.ENTRADA);
      expect(Number(movement.cantidad)).toBe(100);
    });
  });
});
*/

