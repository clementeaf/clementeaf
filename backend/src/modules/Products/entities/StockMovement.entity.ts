import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Warehouse } from './Warehouse.entity';

/**
 * Tipo de movimiento de stock
 */
export enum MovementType {
  ENTRADA = 'entrada',
  SALIDA = 'salida',
  AJUSTE = 'ajuste',
  TRANSFERENCIA = 'transferencia',
  RESERVA = 'reserva'
}

/**
 * Entidad de Movimiento de Stock
 */
@Entity('stock_movements')
@Index(['productId', 'warehouseId'])
@Index(['warehouseId', 'createdAt'])
@Index(['productId', 'warehouseId', 'createdAt'])
export class StockMovement {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  productId!: string;

  @Column({ type: 'varchar', length: 255 })
  productCode!: string;

  @Column({ type: 'varchar', length: 500 })
  productName!: string;

  @Column({ type: 'int' })
  warehouseId!: number;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouseId' })
  warehouse!: Warehouse;

  @Column({
    type: 'enum',
    enum: MovementType,
    default: MovementType.AJUSTE
  })
  type!: MovementType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cantidad!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  stockAnterior!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  stockNuevo!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  documento?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  numeroDocumento?: string | null;

  @Column({ type: 'date', nullable: true })
  fechaDocumento?: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lote?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  observaciones?: string | null;

  @Column({ type: 'int', nullable: true })
  createdBy?: number | null;

  @Column({ type: 'int', nullable: true })
  quoteId?: number | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;
}

