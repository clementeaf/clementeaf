import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../Users/entities/User.entity';

/**
 * Tipos de notificaciones
 */
export enum NotificationType {
  PICKING = 'picking',
  SALES = 'sales'
}

/**
 * Estados de una notificación
 */
export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read'
}

/**
 * Entidad de Notificaciones
 */
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  userId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({
    type: 'enum',
    enum: NotificationType
  })
  type!: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD
  })
  status!: NotificationStatus;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  quoteId!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  codigoOrden!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  clienteNombre!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  vendedor!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  estadoAnterior!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  estadoNuevo!: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  readAt!: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}

