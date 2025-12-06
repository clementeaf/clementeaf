import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Clients } from './Clients.entity';

/**
 * Entidad de Sucursales de Clientes
 */
@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  clientId!: number;

  @ManyToOne(() => Clients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client!: Clients;

  @Column({ type: 'varchar', length: 255 })
  nombre!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  direccion!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  region!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  comuna!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  codigoPostal!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactoNombre!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contactoTelefono!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactoEmail!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

