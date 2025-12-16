import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

/**
 * Factura emitida por el sistema (WMS).
 * Se genera al confirmar picking (carro listo) y queda vinculada a la nota de venta (Quote).
 */
@Entity('wms_invoices')
@Index(['quoteId'], { unique: true })
@Index(['invoiceNumber'], { unique: true })
export class Invoice {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  quoteId!: number;

  @Column({ type: 'int' })
  warehouseId!: number;

  @Column({ type: 'varchar', length: 60 })
  invoiceNumber!: string;

  @Column({ type: 'timestamp with time zone' })
  issueDate!: Date;

  @Column({ type: 'varchar', length: 10, default: 'CLP' })
  currency!: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  netAmount!: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  taxAmount!: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalAmount!: number;

  @Column({ type: 'varchar', length: 30, default: 'emitida' })
  status!: string; // emitida | anulada | enviada

  @Column({ type: 'text', nullable: true })
  xml?: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}


