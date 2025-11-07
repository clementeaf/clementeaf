import { Repository } from 'typeorm';
import { initializeDatabase } from '../../../config/database';
import { CtasPorCobrar } from '../entities/CtasPorCobrar.entity';

export interface QueryFilters {
  rut?: string;
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

  private async getRepository(): Promise<Repository<CtasPorCobrar>> {
    if (!this.repository) {
      const dataSource = await initializeDatabase();
      this.repository = dataSource.getRepository(CtasPorCobrar);
    }
    return this.repository;
  }

  /**
   * Obtiene todas las cuentas por cobrar con paginación y filtros
   */
  async getCtasPorCobrar(filters: QueryFilters = {}): Promise<PaginatedResponse<CtasPorCobrar>> {
    const repository = await this.getRepository();
    
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const queryBuilder = repository.createQueryBuilder('ctas');

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

    // Obtener total y datos paginados
    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Obtiene las deudas activas (deuda > 0)
   */
  async getDeudasActivas(filters: QueryFilters = {}): Promise<PaginatedResponse<CtasPorCobrar>> {
    const repository = await this.getRepository();
    
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const queryBuilder = repository.createQueryBuilder('ctas')
      .where('ctas.deuda > 0');

    // Aplicar filtros adicionales
    if (filters.rut) {
      queryBuilder.andWhere('ctas.rut = :rut', { rut: filters.rut });
    }

    if (filters.codvend) {
      queryBuilder.andWhere('ctas.codvend = :codvend', { codvend: filters.codvend });
    }

    queryBuilder.orderBy('ctas.vencimiento', 'ASC');

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
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
