import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * Entidad de Producto (catálogo operativo WMS)
 * Mantiene un subconjunto de productos relevantes, basado en el formato de Zoho.
 */
@Entity('products')
@Index(['codigo'], { unique: true })
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  codigo!: string;

  @Column({ type: 'varchar', length: 500 })
  nombre!: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  sku?: string | null;

  @Column({ type: 'int', nullable: true })
  zohoId?: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  itemId?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  categoryId?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  categoryName?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand?: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  manufacturer?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  status?: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  rate?: number | null;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  taxPercentage?: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  purchaseRate?: string | null;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  itemType?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  productType?: string | null;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @Column({ type: 'boolean', default: false })
  descontinuado!: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  descontinuadoAt?: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  descontinuadoReason?: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  deletedAt?: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}


