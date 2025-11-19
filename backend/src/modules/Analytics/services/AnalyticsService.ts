import { Repository, DataSource } from 'typeorm';
import { initializeDatabase } from '../../../config/database';
import { CtasPorCobrar } from '../entities/CtasPorCobrar.entity';

export interface QueryFilters {
  rut?: string;
  razsoc?: string;
  codvend?: number;
  team?: string;
  diasVencidosMin?: number;
  diasVencidosMax?: number;
  deudaMin?: number;
  deudaMax?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Interfaz extendida de CtasPorCobrar con datos del cliente
 */
export interface CtasPorCobrarConCliente extends CtasPorCobrar {
  cliente_email: string | null;
  cliente_telefono: string | null;
}

/**
 * Interfaz para empresa con sus documentos agrupados
 */
export interface EmpresaConDocumentos {
  rut: string;
  razsoc: string;
  cliente_email: string | null;
  cliente_telefono: string | null;
  documentos: CtasPorCobrar[];
  total_deuda: number;
  total_documentos: number;
}

export interface ResumenCliente {
  rut: string;
  razsoc: string;
  total_documentos: number;
  deuda_total: number;
  promedio_dias_vencidos: number;
}

export interface ResumenVendedor {
  codvend: number;
  nombre_vendedor: string;
  team: string;
  total_documentos: number;
  deuda_total: number;
  documentos_vencidos: number;
}

export class AnalyticsService {
  private repository: Repository<CtasPorCobrar> | null = null;
  private dataSource: DataSource | null = null;

  private async getRepository(): Promise<Repository<CtasPorCobrar>> {
    if (!this.repository) {
      const ds = await this.getDataSource();
      this.repository = ds.getRepository(CtasPorCobrar);
    }
    return this.repository;
  }

  private async getDataSource(): Promise<DataSource> {
    if (!this.dataSource) {
      this.dataSource = await initializeDatabase();
    }
    return this.dataSource;
  }

  /**
   * Obtiene todas las cuentas por cobrar con paginación y filtros
   * Incluye email y teléfono del cliente mediante JOIN
   */
  async getCtasPorCobrar(filters: QueryFilters = {}): Promise<PaginatedResponse<CtasPorCobrarConCliente>> {
    const repository = await this.getRepository();
    
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const queryBuilder = repository.createQueryBuilder('ctas')
      .leftJoin('clients', 'cliente', 'cliente.rut = ctas.rut')
      .addSelect('cliente.contactoCorreoElectronico', 'cliente_email')
      .addSelect('cliente.contactoTelefono', 'cliente_telefono');

    // Aplicar filtros
    if (filters.rut) {
      queryBuilder.andWhere('ctas.rut = :rut', { rut: filters.rut });
    }

    if (filters.codvend) {
      queryBuilder.andWhere('ctas.codvend = :codvend', { codvend: filters.codvend });
    }

    if (filters.team) {
      queryBuilder.andWhere('ctas.team = :team', { team: filters.team });
    }

    if (filters.diasVencidosMin !== undefined) {
      queryBuilder.andWhere('ctas.dias_vencidos >= :min', { min: filters.diasVencidosMin });
    }

    if (filters.diasVencidosMax !== undefined) {
      queryBuilder.andWhere('ctas.dias_vencidos <= :max', { max: filters.diasVencidosMax });
    }

    if (filters.deudaMin !== undefined) {
      queryBuilder.andWhere('ctas.deuda >= :deudaMin', { deudaMin: filters.deudaMin });
    }

    if (filters.deudaMax !== undefined) {
      queryBuilder.andWhere('ctas.deuda <= :deudaMax', { deudaMax: filters.deudaMax });
    }

    if (filters.fechaDesde) {
      queryBuilder.andWhere('ctas.fecha >= :fechaDesde', { fechaDesde: filters.fechaDesde });
    }

    if (filters.fechaHasta) {
      queryBuilder.andWhere('ctas.fecha <= :fechaHasta', { fechaHasta: filters.fechaHasta });
    }

    // Ordenar por fecha descendente
    queryBuilder.orderBy('ctas.fecha', 'DESC');

    // Obtener total (sin los campos adicionales para el count)
    const countQueryBuilder = repository.createQueryBuilder('ctas');
    if (filters.rut) {
      countQueryBuilder.andWhere('ctas.rut = :rut', { rut: filters.rut });
    }
    if (filters.codvend) {
      countQueryBuilder.andWhere('ctas.codvend = :codvend', { codvend: filters.codvend });
    }
    if (filters.team) {
      countQueryBuilder.andWhere('ctas.team = :team', { team: filters.team });
    }
    if (filters.diasVencidosMin !== undefined) {
      countQueryBuilder.andWhere('ctas.dias_vencidos >= :min', { min: filters.diasVencidosMin });
    }
    if (filters.diasVencidosMax !== undefined) {
      countQueryBuilder.andWhere('ctas.dias_vencidos <= :max', { max: filters.diasVencidosMax });
    }
    if (filters.deudaMin !== undefined) {
      countQueryBuilder.andWhere('ctas.deuda >= :deudaMin', { deudaMin: filters.deudaMin });
    }
    if (filters.deudaMax !== undefined) {
      countQueryBuilder.andWhere('ctas.deuda <= :deudaMax', { deudaMax: filters.deudaMax });
    }
    if (filters.fechaDesde) {
      countQueryBuilder.andWhere('ctas.fecha >= :fechaDesde', { fechaDesde: filters.fechaDesde });
    }
    if (filters.fechaHasta) {
      countQueryBuilder.andWhere('ctas.fecha <= :fechaHasta', { fechaHasta: filters.fechaHasta });
    }
    const total = await countQueryBuilder.getCount();

    // Obtener datos paginados con campos adicionales
    const rawData = await queryBuilder
      .skip(skip)
      .take(limit)
      .getRawMany();

    // Mapear los datos raw a la estructura esperada
    // Los campos de ctas vienen con prefijo 'ctas_'
    const data: CtasPorCobrarConCliente[] = rawData.map((row) => {
      const ctasData: CtasPorCobrar = {
        td: row.ctas_td,
        numdocto: row.ctas_numdocto,
        nrutfact: row.ctas_nrutfact,
        cta: row.ctas_cta,
        razsoc: row.ctas_razsoc,
        rut: row.ctas_rut,
        rutpadre: row.ctas_rutpadre,
        razsoc_padre: row.ctas_razsoc_padre,
        periodo_emision: row.ctas_periodo_emision,
        periodo_vencim: row.ctas_periodo_vencim,
        fecha: row.ctas_fecha,
        vencimiento: row.ctas_vencimiento,
        dias_vencidos: row.ctas_dias_vencidos,
        rango_dias_vencidos: row.ctas_rango_dias_vencidos,
        rango_dias_vencidos_cobranza: row.ctas_rango_dias_vencidos_cobranza,
        debe: row.ctas_debe,
        haber: row.ctas_haber,
        deuda: row.ctas_deuda,
        cta_cod: row.ctas_cta_cod,
        cta_nom: row.ctas_cta_nom,
        pers_cod: row.ctas_pers_cod,
        codvend: row.ctas_codvend,
        nombre_vendedor: row.ctas_nombre_vendedor,
        team: row.ctas_team,
        email_vendedor: row.ctas_email_vendedor,
        numordenc: row.ctas_numordenc,
        hep: row.ctas_hep,
        nrohep: row.ctas_nrohep,
        nrohep1: row.ctas_nrohep1,
        created_at: row.ctas_created_at,
        updated_at: row.ctas_updated_at,
        sync_date: row.ctas_sync_date
      };
      
      return {
        ...ctasData,
        cliente_email: row.cliente_email || null,
        cliente_telefono: row.cliente_telefono || null
      };
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Obtiene las deudas activas (deuda > 0) agrupadas por empresa
   * Incluye email y teléfono del cliente mediante JOIN
   */
  async getDeudasActivas(filters: QueryFilters = {}): Promise<PaginatedResponse<EmpresaConDocumentos>> {
    const repository = await this.getRepository();
    
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // Obtener RUTs únicos que cumplen los filtros (para contar empresas)
    const uniqueRutsQuery = repository.createQueryBuilder('ctas')
      .select('ctas.rut', 'rut')
      .addSelect('ctas.razsoc', 'razsoc')
      .where('ctas.deuda > 0')
      .distinct(true);
    
    // Aplicar todos los filtros
    if (filters.rut) {
      uniqueRutsQuery.andWhere('ctas.rut = :rut', { rut: filters.rut });
    }
    if (filters.razsoc) {
      uniqueRutsQuery.andWhere('LOWER(ctas.razsoc) LIKE LOWER(:razsoc)', { razsoc: `%${filters.razsoc}%` });
    }
    if (filters.codvend) {
      uniqueRutsQuery.andWhere('ctas.codvend = :codvend', { codvend: filters.codvend });
    }
    if (filters.diasVencidosMin !== undefined) {
      uniqueRutsQuery.andWhere('ctas.dias_vencidos >= :diasVencidosMin', { diasVencidosMin: filters.diasVencidosMin });
    }
    if (filters.diasVencidosMax !== undefined) {
      uniqueRutsQuery.andWhere('ctas.dias_vencidos <= :diasVencidosMax', { diasVencidosMax: filters.diasVencidosMax });
    }
    if (filters.deudaMin !== undefined) {
      uniqueRutsQuery.andWhere('ctas.deuda >= :deudaMin', { deudaMin: filters.deudaMin });
    }
    if (filters.deudaMax !== undefined) {
      uniqueRutsQuery.andWhere('ctas.deuda <= :deudaMax', { deudaMax: filters.deudaMax });
    }
    if (filters.fechaDesde) {
      uniqueRutsQuery.andWhere('ctas.fecha >= :fechaDesde', { fechaDesde: filters.fechaDesde });
    }
    if (filters.fechaHasta) {
      uniqueRutsQuery.andWhere('ctas.fecha <= :fechaHasta', { fechaHasta: filters.fechaHasta });
    }
    
    uniqueRutsQuery.orderBy('ctas.razsoc', 'ASC');
    
    const uniqueRuts = await uniqueRutsQuery.getRawMany();
    const totalEmpresas = uniqueRuts.length;

    // Si no hay empresas, retornar vacío
    if (totalEmpresas === 0) {
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      };
    }

    // Paginar los RUTs únicos
    const paginatedRuts = uniqueRuts.slice(skip, skip + limit);
    const ruts = paginatedRuts.map((row: { rut: string }) => row.rut).filter(Boolean);

    // Si no hay RUTs en esta página, retornar vacío
    if (ruts.length === 0) {
      return {
        data: [],
        total: totalEmpresas,
        page,
        limit,
        totalPages: Math.ceil(totalEmpresas / limit)
      };
    }
    
    // Obtener todos los documentos de las empresas en esta página que cumplen los filtros
    const documentosQuery = repository.createQueryBuilder('ctas')
      .where('ctas.deuda > 0')
      .andWhere('ctas.rut IN (:...ruts)', { ruts });
    
    // Aplicar los mismos filtros a los documentos
    if (filters.razsoc) {
      documentosQuery.andWhere('LOWER(ctas.razsoc) LIKE LOWER(:razsoc)', { razsoc: `%${filters.razsoc}%` });
    }
    if (filters.codvend) {
      documentosQuery.andWhere('ctas.codvend = :codvend', { codvend: filters.codvend });
    }
    if (filters.diasVencidosMin !== undefined) {
      documentosQuery.andWhere('ctas.dias_vencidos >= :diasVencidosMin', { diasVencidosMin: filters.diasVencidosMin });
    }
    if (filters.diasVencidosMax !== undefined) {
      documentosQuery.andWhere('ctas.dias_vencidos <= :diasVencidosMax', { diasVencidosMax: filters.diasVencidosMax });
    }
    if (filters.deudaMin !== undefined) {
      documentosQuery.andWhere('ctas.deuda >= :deudaMin', { deudaMin: filters.deudaMin });
    }
    if (filters.deudaMax !== undefined) {
      documentosQuery.andWhere('ctas.deuda <= :deudaMax', { deudaMax: filters.deudaMax });
    }
    if (filters.fechaDesde) {
      documentosQuery.andWhere('ctas.fecha >= :fechaDesde', { fechaDesde: filters.fechaDesde });
    }
    if (filters.fechaHasta) {
      documentosQuery.andWhere('ctas.fecha <= :fechaHasta', { fechaHasta: filters.fechaHasta });
    }
    
    documentosQuery.orderBy('ctas.vencimiento', 'ASC');
    
    const allDocumentos = await documentosQuery.getMany();
    
    // Obtener los datos de clientes para esos RUTs
    let clientsData: Array<{ rut: string; cliente_email: string; cliente_telefono: string }> = [];
    
    if (ruts.length > 0) {
      const dataSource = await this.getDataSource();
      const placeholders = ruts.map((_, index) => `$${index + 1}`).join(',');
      clientsData = await dataSource.query(
        `SELECT rut, "contactoCorreoElectronico" as cliente_email, "contactoTelefono" as cliente_telefono 
         FROM clients 
         WHERE rut IN (${placeholders})`,
        ruts
      );
    }
    
    // Crear un mapa de RUT -> datos de cliente
    interface ClientData {
      email: string | null;
      telefono: string | null;
    }
    
    const clientsMap = new Map<string, ClientData>(
      clientsData.map((c: { rut: string; cliente_email: string; cliente_telefono: string }) => [
        c.rut,
        { email: c.cliente_email || null, telefono: c.cliente_telefono || null }
      ])
    );

    // Agrupar documentos por RUT
    const documentosPorRut = new Map<string, CtasPorCobrar[]>();
    
    allDocumentos.forEach(doc => {
      if (doc.rut) {
        if (!documentosPorRut.has(doc.rut)) {
          documentosPorRut.set(doc.rut, []);
        }
        documentosPorRut.get(doc.rut)!.push(doc);
      }
    });

    // Crear la estructura de respuesta agrupada por empresa
    const data: EmpresaConDocumentos[] = paginatedRuts
      .filter((row: { rut: string }) => row.rut && documentosPorRut.has(row.rut))
      .map((row: { rut: string; razsoc: string }) => {
        const rut = row.rut;
        const documentos = documentosPorRut.get(rut) || [];
        const clientData: ClientData = clientsMap.get(rut) || { email: null, telefono: null };
        
        // Calcular total de deuda y total de documentos
        const total_deuda = documentos.reduce((sum, doc) => {
          // Convertir deuda a número si es string, o usar 0 si es null/undefined
          const deudaValue = typeof doc.deuda === 'string' ? parseFloat(doc.deuda) || 0 : (doc.deuda ?? 0);
          return sum + (isNaN(deudaValue) ? 0 : deudaValue);
        }, 0);
        const total_documentos = documentos.length;

        return {
          rut,
          razsoc: row.razsoc || documentos[0]?.razsoc || '',
          cliente_email: clientData.email,
          cliente_telefono: clientData.telefono,
          documentos,
          total_deuda,
          total_documentos
        };
      });

    return {
      data,
      total: totalEmpresas,
      page,
      limit,
      totalPages: Math.ceil(totalEmpresas / limit)
    };
  }

  /**
   * Obtiene resumen por cliente
   */
  async getResumenPorCliente(limit: number = 10): Promise<ResumenCliente[]> {
    const repository = await this.getRepository();

    const result = await repository
      .createQueryBuilder('ctas')
      .select('ctas.rut', 'rut')
      .addSelect('ctas.razsoc', 'razsoc')
      .addSelect('COUNT(*)', 'total_documentos')
      .addSelect('COALESCE(SUM(ctas.deuda), 0)', 'deuda_total')
      .addSelect('COALESCE(AVG(ctas.dias_vencidos), 0)', 'promedio_dias_vencidos')
      .where('ctas.deuda > 0')
      .groupBy('ctas.rut')
      .addGroupBy('ctas.razsoc')
      .orderBy('deuda_total', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map(r => ({
      rut: r.rut,
      razsoc: r.razsoc,
      total_documentos: parseInt(r.total_documentos),
      deuda_total: parseFloat(r.deuda_total),
      promedio_dias_vencidos: parseFloat(r.promedio_dias_vencidos)
    }));
  }

  /**
   * Obtiene resumen por vendedor
   */
  async getResumenPorVendedor(limit: number = 10): Promise<ResumenVendedor[]> {
    const repository = await this.getRepository();

    const result = await repository
      .createQueryBuilder('ctas')
      .select('ctas.codvend', 'codvend')
      .addSelect('ctas.nombre_vendedor', 'nombre_vendedor')
      .addSelect('ctas.team', 'team')
      .addSelect('COUNT(*)', 'total_documentos')
      .addSelect('COALESCE(SUM(ctas.deuda), 0)', 'deuda_total')
      .addSelect('COUNT(CASE WHEN ctas.dias_vencidos > 0 THEN 1 END)', 'documentos_vencidos')
      .where('ctas.deuda > 0')
      .groupBy('ctas.codvend')
      .addGroupBy('ctas.nombre_vendedor')
      .addGroupBy('ctas.team')
      .orderBy('deuda_total', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map(r => ({
      codvend: r.codvend,
      nombre_vendedor: r.nombre_vendedor,
      team: r.team,
      total_documentos: parseInt(r.total_documentos),
      deuda_total: parseFloat(r.deuda_total),
      documentos_vencidos: parseInt(r.documentos_vencidos)
    }));
  }

  /**
   * Obtiene una cuenta por cobrar específica
   */
  async getCtaPorCobrarById(td: string, numdocto: string): Promise<CtasPorCobrar | null> {
    const repository = await this.getRepository();
    return await repository.findOne({
      where: { td, numdocto }
    });
  }

  /**
   * Obtiene estadísticas generales
   */
  async getEstadisticasGenerales() {
    const repository = await this.getRepository();

    const stats = await repository
      .createQueryBuilder('ctas')
      .select('COUNT(*)', 'total_documentos')
      .addSelect('COALESCE(SUM(ctas.deuda), 0)', 'deuda_total')
      .addSelect('COALESCE(AVG(ctas.deuda), 0)', 'deuda_promedio')
      .addSelect('COUNT(CASE WHEN ctas.deuda > 0 THEN 1 END)', 'documentos_activos')
      .addSelect('COUNT(CASE WHEN ctas.dias_vencidos > 0 THEN 1 END)', 'documentos_vencidos')
      .addSelect('MAX(ctas.sync_date)', 'ultima_sincronizacion')
      .getRawOne();

    return {
      total_documentos: parseInt(stats.total_documentos),
      deuda_total: parseFloat(stats.deuda_total),
      deuda_promedio: parseFloat(stats.deuda_promedio),
      documentos_activos: parseInt(stats.documentos_activos),
      documentos_vencidos: parseInt(stats.documentos_vencidos),
      ultima_sincronizacion: stats.ultima_sincronizacion
    };
  }
}
