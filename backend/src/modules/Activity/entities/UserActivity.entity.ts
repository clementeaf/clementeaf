import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../Users/entities/User.entity';

/**
 * Tipo de actividad
 */
export enum ActivityType {
  // Navegación
  PAGE_VIEW = 'page_view',
  NAVIGATION = 'navigation',
  
  // Interacción
  CLICK = 'click',
  FORM_SUBMIT = 'form_submit',
  SEARCH = 'search',
  
  // Acciones de negocio
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  DOWNLOAD = 'download',
  UPLOAD = 'upload',
  
  // Autenticación
  LOGIN = 'login',
  LOGOUT = 'logout',
  
  // Otras
  ERROR = 'error',
  CUSTOM = 'custom'
}

/**
 * Recurso afectado
 */
export enum ResourceType {
  CLIENT = 'client',
  QUOTE = 'quote',
  PRODUCT = 'product',
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  TICKET = 'ticket',
  NOTIFICATION = 'notification',
  CHAT = 'chat',
  ANALYTICS = 'analytics',
  OCR = 'ocr',
  WHATSAPP = 'whatsapp',
  PAGE = 'page',
  SYSTEM = 'system'
}

/**
 * Entidad de Actividades de Usuario
 * Registra todas las acciones realizadas por los usuarios
 */
@Entity('user_activities')
@Index(['userId', 'createdAt'])
@Index(['activityType', 'createdAt'])
@Index(['resourceType', 'resourceId'])
@Index(['createdAt'])
export class UserActivity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  userId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({
    type: 'enum',
    enum: ActivityType
  })
  activityType!: ActivityType;

  @Column({
    type: 'enum',
    enum: ResourceType,
    nullable: true
  })
  resourceType!: ResourceType | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resourceId!: string | null;

  @Column({ type: 'varchar', length: 500 })
  description!: string;

  // Datos del evento
  @Column({ type: 'varchar', length: 500, nullable: true })
  path!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  method!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  targetElement!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  targetId!: string | null;

  @Column({ type: 'text', nullable: true })
  targetText!: string | null;

  // Metadata adicional
  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any> | null;

  // Información técnica
  @Column({ type: 'varchar', length: 255, nullable: true })
  ipAddress!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sessionId!: string | null;

  // Tiempo de duración (para sesiones, vistas de página, etc.)
  @Column({ type: 'int', nullable: true })
  durationMs!: number | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;
}
