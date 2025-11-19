import { Repository, DataSource } from 'typeorm';
import { initializeDatabase } from '../../../config/database';
import { CtasPorCobrar } from '../entities/CtasPorCobrar.entity';

export interface DiasVencidosRange {
  min?: number;
  max?: number;
}

export type SortOrder = 'asc' | 'desc';
export type SortField = 'razsoc' | 'total_deuda' | 'vencimiento' | 'deuda';

export interface QueryFilters {
  rut?: string;
  razsoc?: string;
  codvend?: number;
  team?: string;
  diasVencidosMin?: number;
  diasVencidosMax?: number;
  diasVencidosRanges?: DiasVencidosRange[];
  deudaMin?: number;
  deudaMax?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  limit?: number;
  sortBy?: SortField;
  sortOrder?: SortOrder;
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
 * Interfaz para sucursal con sus documentos
 */
export interface SucursalConDocumentos {
  rut: string;
  razsoc: string | null;
  ultimos_digitos?: string;
  documentos: CtasPorCobrar[];
  total_deuda: number;
  total_documentos: number;
  vencimientoMasReciente?: string | null;
}

/**
 * Interfaz para empresa con sus documentos agrupados (puede tener sucursales o documentos directos)
 */
export interface EmpresaConDocumentos {
  rut: string; // rutpadre (empresa principal)
  razsoc: string;
  cliente_email: string | null;
  cliente_telefono: string | null;
  sucursal?: SucursalConDocumentos[]; // Array de sucursales (si existen)
  documentos?: CtasPorCobrar[]; // Documentos directos (si no hay sucursales)
  total_deuda: number;
  total_documentos: number;
  vencimientoMasReciente?: string | null;
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
   * Aplica filtros de días vencidos a una consulta
   * Soporta múltiples rangos usando OR
   */
  private applyDiasVencidosFilter(
    queryBuilder: any,
    filters: QueryFilters
  ): void {
    // Si hay múltiples rangos, usar OR
    if (filters.diasVencidosRanges && filters.diasVencidosRanges.length > 0) {
      const conditions: string[] = [];
      const params: Record<string, number> = {};
      
      filters.diasVencidosRanges.forEach((range, index) => {
        const minParam = `diasVencidosMin${index}`;
        const maxParam = `diasVencidosMax${index}`;
        
        // Caso especial: "Por vencer" (max === -1 significa dias_vencidos < 0)
        if (range.max === -1) {
          conditions.push('ctas.dias_vencidos < 0');
        } else if (range.min !== undefined && range.max !== undefined) {
          conditions.push(`(ctas.dias_vencidos >= :${minParam} AND ctas.dias_vencidos <= :${maxParam})`);
          params[minParam] = range.min;
          params[maxParam] = range.max;
        } else if (range.min !== undefined) {
          conditions.push(`ctas.dias_vencidos >= :${minParam}`);
          params[minParam] = range.min;
        } else if (range.max !== undefined) {
          conditions.push(`ctas.dias_vencidos <= :${maxParam}`);
          params[maxParam] = range.max;
        }
      });
      
      if (conditions.length > 0) {
        queryBuilder.andWhere(`(${conditions.join(' OR ')})`, params);
      }
    } else if (filters.diasVencidosMin !== undefined || filters.diasVencidosMax !== undefined) {
      // Mantener compatibilidad con el formato anterior
      // Caso especial: "Por vencer" (max === -1 significa dias_vencidos < 0)
      if (filters.diasVencidosMax === -1) {
        queryBuilder.andWhere('ctas.dias_vencidos < 0');
      } else {
        if (filters.diasVencidosMin !== undefined) {
          queryBuilder.andWhere('ctas.dias_vencidos >= :diasVencidosMin', { diasVencidosMin: filters.diasVencidosMin });
        }
        if (filters.diasVencidosMax !== undefined) {
          queryBuilder.andWhere('ctas.dias_vencidos <= :diasVencidosMax', { diasVencidosMax: filters.diasVencidosMax });
        }
      }
    }
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

    // Obtener rutpadre únicos que cumplen los filtros (para contar empresas principales)
    const uniqueRutPadresQuery = repository.createQueryBuilder('ctas')
      .select('COALESCE(ctas.rutpadre, ctas.rut)', 'rutpadre')
      .addSelect('COALESCE(ctas.razsoc_padre, ctas.razsoc)', 'razsoc')
      .where('ctas.deuda > 0')
      .andWhere('(ctas.rutpadre IS NOT NULL OR ctas.rut IS NOT NULL)')
      .distinct(true);
    
    // Aplicar todos los filtros
    if (filters.rut) {
      uniqueRutPadresQuery.andWhere('(ctas.rut = :rut OR ctas.rutpadre = :rut)', { rut: filters.rut });
    }
    if (filters.razsoc) {
      uniqueRutPadresQuery.andWhere('(LOWER(ctas.razsoc) LIKE LOWER(:razsoc) OR LOWER(ctas.razsoc_padre) LIKE LOWER(:razsoc))', { razsoc: `%${filters.razsoc}%` });
    }
    if (filters.codvend) {
      uniqueRutPadresQuery.andWhere('ctas.codvend = :codvend', { codvend: filters.codvend });
    }
    this.applyDiasVencidosFilter(uniqueRutPadresQuery, filters);
    if (filters.deudaMin !== undefined) {
      uniqueRutPadresQuery.andWhere('ctas.deuda >= :deudaMin', { deudaMin: filters.deudaMin });
    }
    if (filters.deudaMax !== undefined) {
      uniqueRutPadresQuery.andWhere('ctas.deuda <= :deudaMax', { deudaMax: filters.deudaMax });
    }
    if (filters.fechaDesde) {
      uniqueRutPadresQuery.andWhere('ctas.fecha >= :fechaDesde', { fechaDesde: filters.fechaDesde });
    }
    if (filters.fechaHasta) {
      uniqueRutPadresQuery.andWhere('ctas.fecha <= :fechaHasta', { fechaHasta: filters.fechaHasta });
    }
    
    // No aplicar ordenamiento aquí, se hará después de agrupar
    const uniqueRutPadres = await uniqueRutPadresQuery.getRawMany();
    const allRutPadres = uniqueRutPadres
      .map((row: { rutpadre: string }) => row.rutpadre)
      .filter(Boolean);
    const totalEmpresas = allRutPadres.length;

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

    // Obtener todos los documentos de todas las empresas principales que cumplen los filtros
    const documentosQuery = repository.createQueryBuilder('ctas')
      .where('ctas.deuda > 0')
      .andWhere('(COALESCE(ctas.rutpadre, ctas.rut) IN (:...rutPadres))', { rutPadres: allRutPadres });
    
    // Aplicar los mismos filtros a los documentos
    if (filters.razsoc) {
      documentosQuery.andWhere('(LOWER(ctas.razsoc) LIKE LOWER(:razsoc) OR LOWER(ctas.razsoc_padre) LIKE LOWER(:razsoc))', { razsoc: `%${filters.razsoc}%` });
    }
    if (filters.codvend) {
      documentosQuery.andWhere('ctas.codvend = :codvend', { codvend: filters.codvend });
    }
    this.applyDiasVencidosFilter(documentosQuery, filters);
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
    
    // Obtener los datos de clientes para los rutpadre
    let clientsData: Array<{ rut: string; cliente_email: string; cliente_telefono: string }> = [];
    
    if (allRutPadres.length > 0) {
      const dataSource = await this.getDataSource();
      const placeholders = allRutPadres.map((_, index) => `$${index + 1}`).join(',');
      clientsData = await dataSource.query(
        `SELECT rut, "contactoCorreoElectronico" as cliente_email, "contactoTelefono" as cliente_telefono 
         FROM clients 
         WHERE rut IN (${placeholders})`,
        allRutPadres
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

    // Agrupar documentos por rutpadre primero, luego por rut (sucursal)
    // Estructura: Map<rutpadre, Map<rut, documentos[]>>
    const documentosPorEmpresa = new Map<string, Map<string, CtasPorCobrar[]>>();
    
    allDocumentos.forEach(doc => {
      const rutPadre = doc.rutpadre || doc.rut;
      const rut = doc.rut;
      
      if (!rutPadre || !rut) return;
      
      if (!documentosPorEmpresa.has(rutPadre)) {
        documentosPorEmpresa.set(rutPadre, new Map());
      }
      
      const sucursalesMap = documentosPorEmpresa.get(rutPadre)!;
      if (!sucursalesMap.has(rut)) {
        sucursalesMap.set(rut, []);
      }
      
      sucursalesMap.get(rut)!.push(doc);
    });

    /**
     * Extrae los últimos dígitos de una sucursal (después del dígito verificador del rutpadre)
     * Ejemplo: rutpadre "76833720-9", rut "76833720-9521" -> "521"
     */
    const extractUltimosDigitos = (rut: string, rutpadre: string): string | undefined => {
      if (rut === rutpadre) return undefined; // No es sucursal
      
      // Extraer la parte después del guión (dígito verificador + últimos dígitos)
      const rutParts = rut.split('-');
      const rutPadreParts = rutpadre.split('-');
      
      if (rutParts.length !== 2 || rutPadreParts.length !== 2) return undefined;
      
      const rutDigitoVerificador = rutParts[1]; // "9521" en el ejemplo
      const rutPadreDigitoVerificador = rutPadreParts[1]; // "9" en el ejemplo
      
      // Si el dígito verificador de la sucursal empieza con el del rutpadre
      if (rutDigitoVerificador.startsWith(rutPadreDigitoVerificador)) {
        // Extraer los dígitos después del dígito verificador del rutpadre
        const ultimosDigitos = rutDigitoVerificador.substring(rutPadreDigitoVerificador.length);
        return ultimosDigitos.length > 0 ? ultimosDigitos : undefined;
      }
      
      return undefined;
    };

    // Crear la estructura de respuesta agrupada por empresa principal (rutpadre)
    const allEmpresas: EmpresaConDocumentos[] = uniqueRutPadres
      .filter((row: { rutpadre: string }) => row.rutpadre && documentosPorEmpresa.has(row.rutpadre))
      .map((row: { rutpadre: string; razsoc: string }) => {
        const rutPadre = row.rutpadre;
        const sucursalesMap = documentosPorEmpresa.get(rutPadre)!;
        const clientData: ClientData = clientsMap.get(rutPadre) || { email: null, telefono: null };
        
        // Separar documentos de empresa principal (rut === rutpadre) de sucursales
        const documentosEmpresa: CtasPorCobrar[] = [];
        const sucursales: Array<{
          rut: string;
          razsoc: string | null;
          ultimos_digitos?: string;
          documentos: CtasPorCobrar[];
          total_deuda: number;
          total_documentos: number;
          vencimientoMasReciente: string | null;
        }> = [];
        
        sucursalesMap.forEach((documentos, rut) => {
          if (rut === rutPadre) {
            // Es la empresa principal, no una sucursal
            documentosEmpresa.push(...documentos);
          } else {
            // Es una sucursal
            const total_deuda = documentos.reduce((sum, doc) => {
              const deudaValue = typeof doc.deuda === 'string' ? parseFloat(doc.deuda) || 0 : (doc.deuda ?? 0);
              return sum + (isNaN(deudaValue) ? 0 : deudaValue);
            }, 0);
            
            const fechasVencimiento = documentos
              .map(doc => doc.vencimiento ? new Date(doc.vencimiento) : null)
              .filter((date): date is Date => date !== null);
            
            const vencimientoMasReciente = fechasVencimiento.length > 0
              ? fechasVencimiento.sort((a, b) => b.getTime() - a.getTime())[0]
              : null;
            
            sucursales.push({
              rut,
              razsoc: documentos[0]?.razsoc || null,
              ultimos_digitos: extractUltimosDigitos(rut, rutPadre),
              documentos,
              total_deuda,
              total_documentos: documentos.length,
              vencimientoMasReciente: vencimientoMasReciente?.toISOString() || null
            });
          }
        });
        
        // Calcular totales de la empresa (incluyendo sucursales)
        const todosDocumentos = [
          ...documentosEmpresa,
          ...sucursales.flatMap(s => s.documentos)
        ];
        
        const total_deuda = todosDocumentos.reduce((sum, doc) => {
          const deudaValue = typeof doc.deuda === 'string' ? parseFloat(doc.deuda) || 0 : (doc.deuda ?? 0);
          return sum + (isNaN(deudaValue) ? 0 : deudaValue);
        }, 0);
        
        const total_documentos = todosDocumentos.length;
        
        // Encontrar la fecha de vencimiento más reciente de toda la empresa
        const fechasVencimiento = todosDocumentos
          .map(doc => doc.vencimiento ? new Date(doc.vencimiento) : null)
          .filter((date): date is Date => date !== null);
        
        const vencimientoMasReciente = fechasVencimiento.length > 0
          ? fechasVencimiento.sort((a, b) => b.getTime() - a.getTime())[0]
          : null;
        
        // Construir la respuesta
        const empresa: EmpresaConDocumentos = {
          rut: rutPadre,
          razsoc: row.razsoc || documentosEmpresa[0]?.razsoc_padre || documentosEmpresa[0]?.razsoc || '',
          cliente_email: clientData.email,
          cliente_telefono: clientData.telefono,
          total_deuda,
          total_documentos,
          vencimientoMasReciente: vencimientoMasReciente?.toISOString() || null
        };
        
        // Si hay sucursales, agregarlas; si no, agregar documentos directos
        if (sucursales.length > 0) {
          empresa.sucursal = sucursales;
        } else if (documentosEmpresa.length > 0) {
          empresa.documentos = documentosEmpresa;
        }
        
        return empresa;
      });

    // Aplicar ordenamiento
    const sortBy = filters.sortBy || 'razsoc';
    const sortOrder = filters.sortOrder || 'asc';
    
    // Debug: verificar que los parámetros se están recibiendo correctamente
    console.log('Backend - Aplicando ordenamiento:', { 
      sortBy: filters.sortBy, 
      sortOrder: filters.sortOrder,
      sortByFinal: sortBy,
      sortOrderFinal: sortOrder,
      totalEmpresas: allEmpresas.length,
      primeros3Antes: allEmpresas.slice(0, 3).map(e => e.razsoc || e.rut)
    });
    
    allEmpresas.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'razsoc':
          // Ordenamiento alfabético
          comparison = (a.razsoc || '').localeCompare(b.razsoc || '');
          break;
        case 'total_deuda':
        case 'deuda':
          // Ordenamiento por monto (más alto a más bajo)
          comparison = a.total_deuda - b.total_deuda;
          break;
        case 'vencimiento':
          // Ordenamiento por fecha (más reciente a más antigua)
          const fechaA = a.vencimientoMasReciente ? new Date(a.vencimientoMasReciente).getTime() : 0;
          const fechaB = b.vencimientoMasReciente ? new Date(b.vencimientoMasReciente).getTime() : 0;
          comparison = fechaB - fechaA; // Más reciente primero (desc por defecto)
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Debug: verificar el orden después de ordenar
    console.log('Backend - Después de ordenar:', {
      sortBy,
      sortOrder,
      primeros3Despues: allEmpresas.slice(0, 3).map(e => e.razsoc || e.rut)
    });

    // Paginar después del ordenamiento
    const paginatedEmpresas = allEmpresas.slice(skip, skip + limit);
    
    // Debug: verificar el orden después de paginar
    console.log('Backend - Después de paginar:', {
      page,
      limit,
      skip,
      totalPaginated: paginatedEmpresas.length,
      primeros3Paginated: paginatedEmpresas.slice(0, 3).map(e => e.razsoc || e.rut)
    });

    return {
      data: paginatedEmpresas,
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
