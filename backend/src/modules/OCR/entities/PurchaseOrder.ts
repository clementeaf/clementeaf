import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DocumentStatus, DocumentType } from '../types';

/**
 * Entidad para almacenar documentos procesados por OCR
 */
@Entity('ocr_documents')
export class OCRDocument {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  fileName!: string;

  @Column({ type: 'varchar', length: 500 })
  s3Key!: string;

  @Column({ type: 'varchar', length: 255 })
  s3Bucket!: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.PURCHASE_ORDER
  })
  documentType!: DocumentType;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING
  })
  status!: DocumentStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  textractJobId!: string | null;

  // Datos extraídos de la orden de compra
  @Column({ type: 'varchar', length: 100, nullable: true })
  orderNumber!: string | null;

  @Column({ type: 'date', nullable: true })
  issueDate!: Date | null;

  @Column({ type: 'date', nullable: true })
  deliveryDate!: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  companyName!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  companyRut!: string | null;

  // Items almacenados como JSON
  @Column({ type: 'jsonb', nullable: true })
  items!: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    sku?: string;
  }> | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  subtotal!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tax!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total!: number | null;

  @Column({ type: 'text', nullable: true })
  paymentTerms!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  // Respuesta completa de Textract (para debugging)
  @Column({ type: 'jsonb', nullable: true })
  rawTextractResponse!: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  errorMessage!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedAt!: Date | null;
}
