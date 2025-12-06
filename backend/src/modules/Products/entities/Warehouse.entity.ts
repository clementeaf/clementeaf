import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { StockMovement } from './StockMovement.entity';

/**
 * Entidad de Bodega (Warehouse)
 */
@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  codigo!: string;

  @Column({ type: 'varchar', length: 255 })
  nombre!: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  codigoCorto?: string | null;

  @Column({ type: 'text', nullable: true })
  direccion?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ciudad?: string | null;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @OneToMany(() => StockMovement, movement => movement.warehouse)
  movements!: StockMovement[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}

