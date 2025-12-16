import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { Role } from './Role.entity';

/**
 * Entity que representa las capacidades (capabilities) asignadas a un rol de forma dinámica.
 * Permite configurar acciones granulares por módulo para cada rol.
 */
@Entity('role_capabilities')
@Unique(['roleId', 'module', 'action'])
export class RoleCapability {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  roleId!: number;

  @Column({ type: 'varchar' })
  module!: string; // Ej: "picking", "ventas", "productos", "usuarios"

  @Column({ type: 'varchar' })
  action!: string; // Ej: "read", "create", "update", "delete", "approve", "delegate"

  @Column({ default: true, type: 'boolean' })
  allowed!: boolean; // Permite denegar explícitamente una acción

  @ManyToOne(() => Role, (role) => role.roleCapabilities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role!: Role;

  @CreateDateColumn()
  createdAt!: Date;
}
