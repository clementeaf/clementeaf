import { AppDataSource } from '../../../config/database';
import { Warehouse } from '../entities/Warehouse.entity';
import { Repository } from 'typeorm';

/**
 * Servicio para gestionar bodegas
 */
export class WarehouseService {
  private get warehouseRepository(): Repository<Warehouse> {
    return AppDataSource.getRepository(Warehouse);
  }

  /**
   * Obtiene todas las bodegas activas
   * @returns Lista de bodegas activas
   */
  async getAllWarehouses(): Promise<Warehouse[]> {
    return await this.warehouseRepository.find({
      where: { activo: true },
      order: { nombre: 'ASC' }
    });
  }

  /**
   * Obtiene una bodega por ID
   * @param id - ID de la bodega
   * @returns Bodega encontrada o null
   */
  async getWarehouseById(id: number): Promise<Warehouse | null> {
    return await this.warehouseRepository.findOne({
      where: { id, activo: true }
    });
  }

  /**
   * Obtiene una bodega por código
   * @param codigo - Código de la bodega
   * @returns Bodega encontrada o null
   */
  async getWarehouseByCode(codigo: string): Promise<Warehouse | null> {
    return await this.warehouseRepository.findOne({
      where: { codigo, activo: true }
    });
  }
}

