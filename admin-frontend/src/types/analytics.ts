export interface CtasPorCobrar {
  td: string;
  numdocto: string;
  nrutfact: number | null;
  cta: number | null;
  razsoc: string | null;
  rut: string | null;
  rutpadre: string | null;
  razsoc_padre: string | null;
  periodo_emision: string | null;
  periodo_vencim: string | null;
  fecha: string | null;
  vencimiento: string | null;
  dias_vencidos: number | null;
  rango_dias_vencidos: string | null;
  rango_dias_vencidos_cobranza: string | null;
  debe: number | null;
  haber: number | null;
  deuda: number | null;
  cta_cod: string | null;
  cta_nom: string | null;
  pers_cod: string | null;
  codvend: number | null;
  nombre_vendedor: string | null;
  team: string | null;
  email_vendedor: string | null;
  numordenc: string | null;
  hep: string | null;
  nrohep: string | null;
  nrohep1: string | null;
  created_at: string;
  updated_at: string;
  sync_date: string | null;
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

export interface Estadisticas {
  total_documentos: number;
  deuda_total: number;
  deuda_promedio: number;
  documentos_activos: number;
  documentos_vencidos: number;
  ultima_sincronizacion: string;
}

export type SortOrder = 'asc' | 'desc';
export type SortField = 'razsoc' | 'total_deuda' | 'vencimiento' | 'deuda';

/**
 * Rango de días vencidos
 */
export interface DiasVencidosRange {
  min?: number;
  max?: number;
}

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
