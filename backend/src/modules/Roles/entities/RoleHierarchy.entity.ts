import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { Role } from './Role.entity';

/**
 * Entity que define jerarquías entre roles.
 * Permite que un rol padre (Encargado) pueda crear y gestionar roles hijos (Bodegueros).
 */
@Entity('role_hierarchies')
@Unique(['parentRoleId', 'childRoleId'])
export class RoleHierarchy {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  parentRoleId!: number;

  @Column()
  childRoleId!: number;

  @Column({ type: 'varchar', nullable: true })
  moduleScope!: string | null; // Ámbito de delegación (ej: "picking")

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentRoleId' })
  parentRole!: Role;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'childRoleId' })
  childRole!: Role;

  @CreateDateColumn()
  createdAt!: Date;
}
