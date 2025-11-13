import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('products')
@Index(['codigo'])
@Index(['clase1'])
@Index(['eliminado', 'obsoleto', 'publicado'])
export class Product {
  @PrimaryColumn({ type: 'int' })
  nregist!: number;

  @Column({ type: 'varchar', length: 50 })
  codigo!: string;

  @Column({ type: 'varchar', length: 255 })
  nombre!: string;

  @Column({ type: 'int', nullable: true })
  tipo!: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  codigo2!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  codigo3!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nombre2!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  clase1!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  clase2!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  clase3!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  clase4!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unidmed!: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  monevta!: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 5, nullable: true })
  precvta!: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  margenvta!: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  costorep!: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  pultcom!: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  valprom!: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  art_dispon!: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  art_critic!: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  art_optimo!: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  art_llegar!: number | null;

  @Column({ type: 'varchar', length: 1, nullable: true })
  eliminado!: string | null;

  @Column({ type: 'varchar', length: 1, nullable: true })
  obsoleto!: string | null;

  @Column({ type: 'int', nullable: true })
  publicado!: number | null;

  @Column({ type: 'int', nullable: true })
  producto_web!: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  filtro_web!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stock_web!: string | null;

  @Column({ type: 'text', nullable: true })
  obs!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  prov!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paisori!: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  fechacrea!: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  fechamodif!: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  proxllega!: Date | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  user_modi!: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  @Column({ type: 'date', nullable: true })
  sync_date!: Date | null;
}

