import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * Balance contable agregado por bodega (haberes/inventario valorizado).
 * Se actualiza automáticamente al emitir facturas (salida).
 */
@Entity('wms_warehouse_accounting_balances')
export class WarehouseAccountingBalance {
  @PrimaryColumn({ type: 'int' })
  warehouseId!: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  inventoryValue!: number;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}


