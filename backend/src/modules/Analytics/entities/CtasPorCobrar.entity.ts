import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('analytics_ctas_por_cobrar')
export class CtasPorCobrar {
  @PrimaryColumn({ type: 'varchar', length: 10 })
  td!: string;

  @PrimaryColumn({ type: 'varchar', length: 50 })
  numdocto!: string;

  // Información del cliente
  @Column({ type: 'int', nullable: true })
  nrutfact!: number | null;

  @Column({ type: 'int', nullable: true })
  cta!: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  razsoc!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  rut!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  rutpadre!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  razsoc_padre!: string | null;

  // Periodos
  @Column({ type: 'varchar', length: 7, nullable: true })
  periodo_emision!: string | null;

  @Column({ type: 'varchar', length: 7, nullable: true })
  periodo_vencim!: string | null;

  // Fechas
  @Column({ type: 'timestamp with time zone', nullable: true })
  fecha!: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  vencimiento!: Date | null;

  // Análisis de vencimiento
  @Column({ type: 'int', nullable: true })
  dias_vencidos!: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  rango_dias_vencidos!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  rango_dias_vencidos_cobranza!: string | null;

  // Montos
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  debe!: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  haber!: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  deuda!: number | null;

  // Cuenta contable
  @Column({ type: 'varchar', length: 20, nullable: true })
  cta_cod!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cta_nom!: string | null;

  // Información del vendedor
  @Column({ type: 'varchar', length: 20, nullable: true })
  pers_cod!: string | null;

  @Column({ type: 'int', nullable: true })
  codvend!: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nombre_vendedor!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  team!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email_vendedor!: string | null;

  // Información adicional
  @Column({ type: 'varchar', length: 50, nullable: true })
  numordenc!: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  hep!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nrohep!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nrohep1!: string | null;

  // Metadata
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  @Column({ type: 'date', nullable: true })
  sync_date!: Date | null;
}
