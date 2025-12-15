import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Entidad de Órdenes de compra
 */
@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn()
  id!: number;

  // Paso 1: Información del Cliente
  @Column({ type: 'varchar', length: 255 })
  clienteNombre!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  direccionFacturacion!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  telefono!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  regionComunaCodigo!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  asesorAsignado!: string | null;

  // Contacto
  @Column({ type: 'varchar', length: 255, nullable: true })
  contactoNombre!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contactoTelefono!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactoEmail!: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  countryCode!: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  countryDialCode!: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  contactoCountryCode!: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  contactoCountryDialCode!: string | null;

  // Paso 2: Condiciones
  @Column({ type: 'varchar', length: 100, nullable: true })
  numeroCotizacion!: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  fecha!: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  terminosPago!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  numeroReferencia!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  centroCosto!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  listaPrecios!: string | null;

  @Column({ type: 'boolean', default: false })
  sinCostoEnvio!: boolean;

  // Paso 3: Productos (JSON)
  @Column({ type: 'text', nullable: true })
  productos!: string | null;

  // Estado de la orden de compra
  @Column({ type: 'varchar', length: 50, default: 'borrador' })
  estado!: string; // 'borrador', 'enviada', 'aprobada', 'rechazada', 'cancelada'

  // Estado de picking (cuando la nota es aprobada)
  @Column({ type: 'varchar', length: 50, nullable: true })
  estadoPicking!: string | null; // 'iniciado', 'recolectado', 'confirmado', 'en_ruta'

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

