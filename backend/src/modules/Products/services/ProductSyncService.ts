import { initializeDatabase } from '../../../config/database';
import { Product } from '../entities/Product.entity';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';

interface ApiProductItem {
  NREGUIST?: number;
  CODIGO?: string;
  NOMBRE?: string;
  TIPO?: number;
  CODIGO2?: string;
  CODIGO3?: string;
  NOMBRE2?: string;
  CLASE1?: string;
  CLASE2?: string;
  CLASE3?: string;
  CLASE4?: string;
  UNIDMED?: string;
  MONEVTA?: string;
  PRECVTA?: string | number;
  MARGENVTA?: string | number;
  COSTOREP?: string | number;
  PULTCOM?: string | number;
  VALPROM?: string | number;
  ART_DISPON?: string | number;
  ART_CRITIC?: string | number;
  ART_OPTIMO?: string | number;
  ART_LLEGAR?: string | number;
  ELIMINADO?: string;
  OBSOLETO?: string;
  PUBLICADO?: number;
  PRODUCTO_WEB?: number;
  FILTRO_WEB?: string;
  STOCK_WEB?: string;
  OBS?: string;
  PROV?: string;
  PAISORI?: string;
  FECHACREA?: {
    date: string;
    timezone_type: number;
    timezone: string;
  };
  FECHAMODIF?: {
    date: string;
    timezone_type: number;
    timezone: string;
  };
  PROXLLEGA?: {
    date: string;
    timezone_type: number;
    timezone: string;
  } | null;
  USERMODI?: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    registros?: ApiProductItem[];
    pagination?: {
      total_pages: number;
      total_records: number;
      current_page: number;
      per_page: number;
    };
  };
  error?: string;
}

/**
 * Servicio para sincronizar productos desde la API externa a la base de datos
 */
export class ProductSyncService {
  private apiUrl: string;
  private token: string;
  private base: string;
  private tabla: string;
  private perPage: number;

  constructor() {
    this.apiUrl = process.env.PRODUCTS_API_URL ?? 'https://sistemas.banados.cl/apiManager/api/getData.php';
    // Decodificar el token si viene codificado desde las variables de entorno
    const rawToken = process.env.PRODUCTS_API_TOKEN ?? 'Banados2024!SecureToken%23987';
    this.token = decodeURIComponent(rawToken);
    this.base = process.env.PRODUCTS_API_BASE ?? 'Banados';
    this.tabla = process.env.PRODUCTS_API_TABLA ?? 'ART_DB';
    this.perPage = parseInt(process.env.PRODUCTS_API_PER_PAGE ?? '250', 10);
  }

  /**
   * Convierte un objeto de fecha de PHP a Date de JavaScript
   */
  private parsePhpDate(dateObj: { date: string; timezone_type: number; timezone: string } | undefined | null): Date | null {
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
  private parseNumber(value: string | number | undefined | null): number | null {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    if (typeof value === 'number') {
      return value;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Obtiene una página de datos de la API
   */
  private async fetchPage(pageNumber: number): Promise<ApiResponse | null> {
    return new Promise((resolve, reject) => {
      // Construir URL manualmente para evitar doble encoding del token
      const params = new URLSearchParams();
      params.append('token', this.token);
      params.append('base', this.base);
      params.append('tabla', this.tabla);
      params.append('page', pageNumber.toString());
      params.append('per_page', this.perPage.toString());

      const url = new URL(`${this.apiUrl}?${params.toString()}`);
      
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'GET',
        rejectUnauthorized: false
      };

      const client = url.protocol === 'https:' ? https : http;

      const req = client.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const jsonData: ApiResponse = JSON.parse(data);
            resolve(jsonData);
          } catch (error) {
            reject(new Error(`Error parsing API response: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Error fetching page ${pageNumber}: ${error.message}`));
      });

      req.setTimeout(60000, () => {
        req.destroy();
        reject(new Error(`Timeout fetching page ${pageNumber}`));
      });

      req.end();
    });
  }

  /**
   * Mapea un item de la API a la entidad Product
   */
  private mapApiItemToEntity(item: ApiProductItem): Product {
    const entity = new Product();
    
    entity.nregist = item.NREGUIST ?? 0;
    entity.codigo = item.CODIGO ?? '';
    entity.nombre = item.NOMBRE ?? '';
    entity.tipo = item.TIPO ?? null;
    entity.codigo2 = item.CODIGO2 ?? null;
    entity.codigo3 = item.CODIGO3 ?? null;
    entity.nombre2 = item.NOMBRE2 ?? null;
    entity.clase1 = item.CLASE1 ?? null;
    entity.clase2 = item.CLASE2 ?? null;
    entity.clase3 = item.CLASE3 ?? null;
    entity.clase4 = item.CLASE4 ?? null;
    entity.unidmed = item.UNIDMED ?? null;
    entity.monevta = item.MONEVTA ?? null;
    entity.precvta = this.parseNumber(item.PRECVTA);
    entity.margenvta = this.parseNumber(item.MARGENVTA);
    entity.costorep = this.parseNumber(item.COSTOREP);
    entity.pultcom = this.parseNumber(item.PULTCOM);
    entity.valprom = this.parseNumber(item.VALPROM);
    entity.art_dispon = this.parseNumber(item.ART_DISPON);
    entity.art_critic = this.parseNumber(item.ART_CRITIC);
    entity.art_optimo = this.parseNumber(item.ART_OPTIMO);
    entity.art_llegar = this.parseNumber(item.ART_LLEGAR);
    entity.eliminado = item.ELIMINADO ?? null;
    entity.obsoleto = item.OBSOLETO ?? null;
    entity.publicado = item.PUBLICADO ?? null;
    entity.producto_web = item.PRODUCTO_WEB ?? null;
    entity.filtro_web = item.FILTRO_WEB ?? null;
    entity.stock_web = item.STOCK_WEB ?? null;
    entity.obs = item.OBS ?? null;
    entity.prov = item.PROV ?? null;
    entity.paisori = item.PAISORI ?? null;
    entity.fechacrea = this.parsePhpDate(item.FECHACREA);
    entity.fechamodif = this.parsePhpDate(item.FECHAMODIF);
    entity.proxllega = this.parsePhpDate(item.PROXLLEGA);
    entity.user_modi = item.USERMODI ?? null;
    entity.sync_date = new Date();

    return entity;
  }

  /**
   * Sincroniza los productos desde la API externa a la base de datos
   */
  async syncProducts(): Promise<{ imported: number; updated: number; errors: number; totalPages: number; totalRecords: number }> {
    const dataSource = await initializeDatabase();
    const repository = dataSource.getRepository(Product);

    console.log('Iniciando sincronización de productos desde API externa...');

    // Obtener primera página para conocer el total de páginas
    const firstPage = await this.fetchPage(1);
    
    if (!firstPage || !firstPage.success) {
      throw new Error(`Error obteniendo primera página: ${firstPage?.error ?? 'Unknown error'}`);
    }

    const pagination = firstPage.data?.pagination;
    if (!pagination) {
      throw new Error('No se pudo obtener información de paginación');
    }

    const totalPages = pagination.total_pages;
    const totalRecords = pagination.total_records;

    console.log(`Total de páginas: ${totalPages}`);
    console.log(`Total de registros: ${totalRecords}`);

    let imported = 0;
    let updated = 0;
    let errors = 0;

    const batchSize = 100;
    let currentBatch: Product[] = [];

    // Procesar todas las páginas
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        console.log(`Procesando página ${pageNum} de ${totalPages}...`);
        
        const pageData = await this.fetchPage(pageNum);
        
        if (!pageData || !pageData.success || !pageData.data?.registros) {
          console.error(`Error en página ${pageNum}`);
          errors += this.perPage;
          continue;
        }

        const records = pageData.data.registros;

        for (const record of records) {
          try {
            const entity = this.mapApiItemToEntity(record);
            currentBatch.push(entity);

            if (currentBatch.length >= batchSize) {
              const batchResults = await this.processBatch(repository, currentBatch);
              imported += batchResults.imported;
              updated += batchResults.updated;
              currentBatch = [];
            }
          } catch (error) {
            console.error(`Error procesando registro ${record.CODIGO}:`, error);
            errors++;
          }
        }

        // Pequeña pausa para no sobrecargar la API
        if (pageNum < totalPages) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (error) {
        console.error(`Error procesando página ${pageNum}:`, error);
        errors += this.perPage;
      }
    }

    // Procesar el último batch si queda algo
    if (currentBatch.length > 0) {
      const batchResults = await this.processBatch(repository, currentBatch);
      imported += batchResults.imported;
      updated += batchResults.updated;
    }

    return { imported, updated, errors, totalPages, totalRecords };
  }

  /**
   * Procesa un batch de productos usando upsert
   */
  private async processBatch(repository: any, batch: Product[]): Promise<{ imported: number; updated: number }> {
    let imported = 0;
    let updated = 0;

    for (const entity of batch) {
      try {
        const existing = await repository.findOne({
          where: { nregist: entity.nregist }
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
        console.error(`Error guardando producto ${entity.codigo}:`, error);
        // Continuar con el siguiente producto en lugar de fallar todo el batch
      }
    }

    return { imported, updated };
  }
}

