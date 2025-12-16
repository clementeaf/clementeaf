import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../Users/entities/User.entity';
import { RolePermission } from './RolePermission.entity';
import { RoleCapability } from './RoleCapability.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, type: 'varchar' })
  name!: string;

  @Column({ nullable: true, type: 'varchar' })
  description!: string | null;

  @Column({ default: true, type: 'boolean' })
  isActive!: boolean;

  @Column({ default: false, type: 'boolean' })
  isSystemRole!: boolean; // Roles del sistema no editables (admin, super_admin)

  @Column({ type: 'simple-array', nullable: true })
  moduleScopes!: string[] | null; // Módulos a los que tiene acceso: ["picking", "ventas"]

  @Column({ default: false, type: 'boolean' })
  canDelegatePermissions!: boolean; // Puede crear subalternos y asignar permisos

  @OneToMany(() => User, (user) => user.role)
  users!: User[];

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions!: RolePermission[];

  @OneToMany(() => RoleCapability, (roleCapability) => roleCapability.role)
  roleCapabilities!: RoleCapability[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

