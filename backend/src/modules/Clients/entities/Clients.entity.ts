import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Entidad de Clientes
 */
@Entity('clients')
export class Clients {
  @PrimaryGeneratedColumn()
  id!: number;

  // Paso 1: Información del Cliente
  @Column({ type: 'varchar', length: 20, unique: true })
  rut!: string;

  @Column({ type: 'varchar', length: 255 })
  razonSocial!: string;

  @Column({ type: 'varchar', length: 255 })
  nombreCliente!: string;

  @Column({ type: 'varchar', length: 20 })
  rutCompleto!: string;

  @Column({ type: 'varchar', length: 255 })
  giro!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sitioWeb!: string | null;

  // Paso 2: Segmentación
  @Column({ type: 'varchar', length: 255, nullable: true })
  propietarioCliente!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tamanoEmpresa!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  segmento!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  subsegmento!: string | null;

  @Column({ type: 'int', nullable: true })
  empleados!: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tratos!: string | null;

  // Paso 3: Facturación
  @Column({ type: 'varchar', length: 50, nullable: true })
  documentoPorDefecto!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  formaPago!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  listaPrecios!: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  ingresosAnuales!: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  limiteCredito!: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  creditoUsado!: number | null;

  @Column({ type: 'text', nullable: true })
  motivoBloqueo!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  respaldoRUT!: string | null;

  @Column({ type: 'boolean', default: false })
  clienteExigeOC!: boolean;

  @Column({ type: 'boolean', default: false })
  aprobadoPorFinanzas!: boolean;

  // Paso 4: Contacto
  @Column({ type: 'varchar', length: 255, nullable: true })
  contactoNombre!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactoCargo!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactoCorreoElectronico!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  contactoTelefono!: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  contactoCountryCode!: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  contactoCountryDialCode!: string | null;

  // Paso 5: Dirección de Facturación
  @Column({ type: 'varchar', length: 255, nullable: true })
  direccionFacturacion!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  regionFacturacion!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  comunaFacturacion!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  codigoPostalFacturacion!: string | null;

  // Paso 5: Dirección de Despacho
  @Column({ type: 'varchar', length: 255, nullable: true })
  direccionDespacho!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  regionDespacho!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  comunaDespacho!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  codigoPostalDespacho!: string | null;

  @Column({ type: 'boolean', default: false })
  usarMismaDireccion!: boolean;

  // Metadata
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}

