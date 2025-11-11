import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../Users/entities/User.entity';

/**
 * Enum para el estado del ticket
 */
export enum TicketStatus {
  REQUESTED = 'requested',
  IN_PROGRESS = 'in-progress',
  TESTING = 'testing',
  PRODUCTION = 'production'
}

/**
 * Enum para el tipo de ticket
 */
export enum TicketType {
  BUG = 'bug',
  OPTIMIZATION = 'optimization',
  FEATURE = 'feature'
}

/**
 * Enum para la prioridad del ticket
 */
export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Entidad de Tickets
 */
@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'enum',
    enum: TicketType,
    default: TicketType.BUG
  })
  type!: TicketType;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM
  })
  priority!: TicketPriority;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.REQUESTED
  })
  status!: TicketStatus;

  @Column({ type: 'int' })
  reporterId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporterId' })
  reporter!: User;

  @Column({ type: 'int', nullable: true })
  assigneeId!: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigneeId' })
  assignee!: User | null;

  @Column({ type: 'json', nullable: true })
  images!: string[] | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}

