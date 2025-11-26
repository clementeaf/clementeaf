import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * Migración para crear la tabla quotes
 */
export class CreateQuotesTable1700000000001 implements MigrationInterface {
  /**
   * Crea la tabla quotes
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'quotes',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'clienteNombre',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'direccionFacturacion',
            type: 'varchar',
            length: '500',
            isNullable: true
          },
          {
            name: 'telefono',
            type: 'varchar',
            length: '50',
            isNullable: true
          },
          {
            name: 'regionComunaCodigo',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'asesorAsignado',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'contactoNombre',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'contactoTelefono',
            type: 'varchar',
            length: '50',
            isNullable: true
          },
          {
            name: 'contactoEmail',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'countryCode',
            type: 'varchar',
            length: '10',
            isNullable: true
          },
          {
            name: 'countryDialCode',
            type: 'varchar',
            length: '10',
            isNullable: true
          },
          {
            name: 'contactoCountryCode',
            type: 'varchar',
            length: '10',
            isNullable: true
          },
          {
            name: 'contactoCountryDialCode',
            type: 'varchar',
            length: '10',
            isNullable: true
          },
          {
            name: 'numeroCotizacion',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'fecha',
            type: 'timestamp with time zone',
            isNullable: true
          },
          {
            name: 'terminosPago',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'numeroReferencia',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'centroCosto',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'listaPrecios',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'sinCostoEnvio',
            type: 'boolean',
            default: false,
            isNullable: false
          },
          {
            name: 'productos',
            type: 'text',
            isNullable: true
          },
          {
            name: 'estado',
            type: 'varchar',
            length: '50',
            default: 'borrador',
            isNullable: false
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false
          }
        ]
      }),
      true
    );
  }

  /**
   * Elimina la tabla quotes
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('quotes');
  }
}

