import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

/**
 * Ledger de inventario valorizado (detalle contable).
 * Por ahora registramos sólo salidas al emitir factura.
 */
@Entity('wms_inventory_ledger')
@Index(['warehouseId', 'createdAt'])
@Index(['quoteId'])
@Index(['invoiceId'])
@Index(['productCode'])
export class InventoryLedgerEntry {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  warehouseId!: number;

  @Column({ type: 'varchar', length: 100 })
  productCode!: string;

  @Column({ type: 'varchar', length: 500 })
  productName!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  quantity!: number; // salida positiva

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  costUnit!: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  value!: number; // quantity * costUnit

  @Column({ type: 'int', nullable: true })
  quoteId?: number | null;

  @Column({ type: 'int', nullable: true })
  invoiceId?: number | null;

  @Column({ type: 'int', nullable: true })
  stockMovementId?: number | null;

  @Column({ type: 'varchar', length: 20, default: 'OUT' })
  direction!: 'OUT' | 'IN';

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;
}


