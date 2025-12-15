import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Migración para crear la tabla ocr_documents
 */
export class CreateOCRDocumentsTable1700000000002 implements MigrationInterface {
  /**
   * Crea la tabla ocr_documents con índices para optimización de consultas
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Habilitar extensión UUID si no existe
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Crear tipos ENUM si no existen
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "document_type_enum" AS ENUM ('PURCHASE_ORDER', 'INVOICE', 'RECEIPT', 'OTHER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "document_status_enum" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Crear tabla ocr_documents
    await queryRunner.createTable(
      new Table({
        name: 'ocr_documents',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
          },
          {
            name: 'fileName',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 's3Key',
            type: 'varchar',
            length: '500',
            isNullable: false
          },
          {
            name: 's3Bucket',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'documentType',
            type: 'document_type_enum',
            default: "'PURCHASE_ORDER'",
            isNullable: false
          },
          {
            name: 'status',
            type: 'document_status_enum',
            default: "'PENDING'",
            isNullable: false
          },
          {
            name: 'textractJobId',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'orderNumber',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'issueDate',
            type: 'date',
            isNullable: true
          },
          {
            name: 'deliveryDate',
            type: 'date',
            isNullable: true
          },
          {
            name: 'companyName',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'companyRut',
            type: 'varchar',
            length: '50',
            isNullable: true
          },
          {
            name: 'items',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'subtotal',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true
          },
          {
            name: 'tax',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true
          },
          {
            name: 'total',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true
          },
          {
            name: 'paymentTerms',
            type: 'text',
            isNullable: true
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true
          },
          {
            name: 'rawTextractResponse',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'errorMessage',
            type: 'text',
            isNullable: true
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
          },
          {
            name: 'processedAt',
            type: 'timestamp with time zone',
            isNullable: true
          }
        ]
      }),
      true
    );

    // Crear índices para optimizar consultas comunes
    await queryRunner.createIndex(
      'ocr_documents',
      new TableIndex({
        name: 'IDX_OCR_DOCUMENTS_STATUS',
        columnNames: ['status']
      })
    );

    await queryRunner.createIndex(
      'ocr_documents',
      new TableIndex({
        name: 'IDX_OCR_DOCUMENTS_CREATED_AT',
        columnNames: ['createdAt']
      })
    );

    await queryRunner.createIndex(
      'ocr_documents',
      new TableIndex({
        name: 'IDX_OCR_DOCUMENTS_DOCUMENT_TYPE',
        columnNames: ['documentType']
      })
    );

    await queryRunner.createIndex(
      'ocr_documents',
      new TableIndex({
        name: 'IDX_OCR_DOCUMENTS_STATUS_CREATED_AT',
        columnNames: ['status', 'createdAt']
      })
    );

    await queryRunner.createIndex(
      'ocr_documents',
      new TableIndex({
        name: 'IDX_OCR_DOCUMENTS_COMPANY_RUT',
        columnNames: ['companyRut']
      })
    );
  }

  /**
   * Elimina la tabla ocr_documents y los tipos ENUM
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.dropIndex('ocr_documents', 'IDX_OCR_DOCUMENTS_STATUS');
    await queryRunner.dropIndex('ocr_documents', 'IDX_OCR_DOCUMENTS_CREATED_AT');
    await queryRunner.dropIndex('ocr_documents', 'IDX_OCR_DOCUMENTS_DOCUMENT_TYPE');
    await queryRunner.dropIndex('ocr_documents', 'IDX_OCR_DOCUMENTS_STATUS_CREATED_AT');
    await queryRunner.dropIndex('ocr_documents', 'IDX_OCR_DOCUMENTS_COMPANY_RUT');

    // Eliminar tabla
    await queryRunner.dropTable('ocr_documents');

    // Eliminar tipos ENUM
    await queryRunner.query(`DROP TYPE IF EXISTS "document_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "document_type_enum"`);
  }
}
