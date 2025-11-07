import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { initializeDatabase } from '../../../config/database';
import { CtasPorCobrar } from '../entities/CtasPorCobrar.entity';

interface S3DataItem {
  TD: string;
  NUMDOCTO: string;
  NRUTFACT?: number;
  PeriodoEmision?: string;
  PeriodoVencim?: string;
  FECHA?: {
    date: string;
    timezone_type: number;
    timezone: string;
  };
  VENCIMIE?: {
    date: string;
    timezone_type: number;
    timezone: string;
  };
  diasVencidos?: number;
  rangoDiasVencidos?: string;
  rangoDiasVencidosCobranza?: string;
  DEBE?: string;
  HABER?: string;
  DEUDA?: string;
  CTA?: number;
  RAZSOC?: string;
  RUT?: string;
  CTA_COD?: string;
  CTA_NOM?: string;
  PERS_COD?: string;
  CODVEND?: number;
  NOMBRE_VENDEDOR?: string;
  TEAM?: string;
  NUMORDENC?: string;
  HEP?: string;
  NROHEP?: string;
  NROHEP1?: string;
  RUTPADRE?: string;
  RAZSOC_PADRE?: string;
  emailVend?: string;
}

/**
 * Servicio para sincronizar datos desde S3 a la base de datos
 */
export class SyncService {
  private s3Client: S3Client;
  private bucketName: string;
  private key: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.AWS_ENDPOINT_URL || undefined
    });
    this.bucketName = process.env.S3_BUCKET_NAME ?? 'banados-analytics-data';
    this.key = process.env.S3_DATA_KEY ?? 'Analytics_CtasPorCobrar/combined_data.json';
  }

  /**
   * Convierte un objeto de fecha de PHP a Date de JavaScript
   */
  private parsePhpDate(dateObj: { date: string; timezone_type: number; timezone: string } | undefined): Date | null {
    if (!dateObj || !dateObj.date) {
      return null;
    }
    try {
      return new Date(dateObj.date);
    } catch {
      return null;
    }
  }

  /**
   * Convierte un string numérico a número
   */
  private parseNumber(value: string | number | undefined): number | null {
    if (value === undefined || value === null) {
      return null;
    }
    if (typeof value === 'number') {
      return value;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Mapea un item de S3 a la entidad CtasPorCobrar
   */
  private mapS3ItemToEntity(item: S3DataItem): CtasPorCobrar {
    const entity = new CtasPorCobrar();
    
    entity.td = item.TD;
    entity.numdocto = item.NUMDOCTO;
    entity.nrutfact = item.NRUTFACT ?? null;
    entity.periodo_emision = item.PeriodoEmision ?? null;
    entity.periodo_vencim = item.PeriodoVencim ?? null;
    entity.fecha = this.parsePhpDate(item.FECHA);
    entity.vencimiento = this.parsePhpDate(item.VENCIMIE);
    entity.dias_vencidos = item.diasVencidos ?? null;
    entity.rango_dias_vencidos = item.rangoDiasVencidos ?? null;
    entity.rango_dias_vencidos_cobranza = item.rangoDiasVencidosCobranza ?? null;
    entity.debe = this.parseNumber(item.DEBE);
    entity.haber = this.parseNumber(item.HABER);
    entity.deuda = this.parseNumber(item.DEUDA);
    entity.cta = item.CTA ?? null;
    entity.razsoc = item.RAZSOC ?? null;
    entity.rut = item.RUT ?? null;
    entity.cta_cod = item.CTA_COD ?? null;
    entity.cta_nom = item.CTA_NOM ?? null;
    entity.pers_cod = item.PERS_COD ?? null;
    entity.codvend = item.CODVEND ?? null;
    entity.nombre_vendedor = item.NOMBRE_VENDEDOR ?? null;
    entity.team = item.TEAM ?? null;
    entity.email_vendedor = item.emailVend ?? null;
    entity.numordenc = item.NUMORDENC ?? null;
    entity.hep = item.HEP ?? null;
    entity.nrohep = item.NROHEP ?? null;
    entity.nrohep1 = item.NROHEP1 ?? null;
    entity.rutpadre = item.RUTPADRE ?? null;
    entity.razsoc_padre = item.RAZSOC_PADRE ?? null;
    entity.sync_date = new Date();

    return entity;
  }

  /**
   * Obtiene los datos desde S3
   */
  async getDataFromS3(): Promise<S3DataItem[]> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: this.key
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Body) {
        throw new Error('No data found in S3 object');
      }

      const bodyString = await response.Body.transformToString();
      const data: S3DataItem[] = JSON.parse(bodyString);

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error reading from S3: ${error.message}`);
      }
      throw new Error('Unknown error reading from S3');
    }
  }

  /**
   * Sincroniza los datos desde S3 a la base de datos
   */
  async syncData(): Promise<{ imported: number; updated: number; errors: number }> {
    const dataSource = await initializeDatabase();
    const repository = dataSource.getRepository(CtasPorCobrar);

    const s3Data = await this.getDataFromS3();
    
    let imported = 0;
    let updated = 0;
    let errors = 0;

    const batchSize = 1000;
    const batches: S3DataItem[][] = [];
    
    for (let i = 0; i < s3Data.length; i += batchSize) {
      batches.push(s3Data.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      try {
        const entities = batch.map(item => this.mapS3ItemToEntity(item));
        
        for (const entity of entities) {
          try {
            const existing = await repository.findOne({
              where: {
                td: entity.td,
                numdocto: entity.numdocto
              }
            });

            if (existing) {
              Object.assign(existing, entity);
              await repository.save(existing);
              updated++;
            } else {
              await repository.save(entity);
              imported++;
            }
          } catch (error) {
            console.error(`Error processing item ${entity.td}-${entity.numdocto}:`, error);
            errors++;
          }
        }
      } catch (error) {
        console.error('Error processing batch:', error);
        errors += batch.length;
      }
    }

    return { imported, updated, errors };
  }
}

