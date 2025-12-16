import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

/**
 * Ítem de factura (detalle).
 */
@Entity('wms_invoice_items')
@Index(['invoiceId'])
@Index(['productCode'])
export class InvoiceItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  invoiceId!: number;

  @Column({ type: 'varchar', length: 100 })
  productCode!: string;

  @Column({ type: 'varchar', length: 500 })
  productName!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  quantity!: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  unitPrice!: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  lineTotal!: number;

  // Costeo (haberes): costo unitario y total al momento de emitir
  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  costUnit?: number | null;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  costTotal?: number | null;
}


