/**
 * Tipos e interfaces para el módulo CheckAuditor
 */

export interface CheckAuditorConfig {
  apiKey: string;
  baseUrl: string;
  timeout?: number;
}

export interface CheckAuditorResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DueDiligenceRequest {
  rut: string;
  tipo: 'cliente' | 'proveedor';
  incluirAntecedentes?: boolean;
  incluirRecomendaciones?: boolean;
}

export interface Antecedente {
  tipo: string;
  descripcion: string;
  fecha?: string;
  estado: string;
}

export interface Recomendacion {
  nivel: 'bajo' | 'medio' | 'alto';
  categoria: string;
  descripcion: string;
  accionSugerida: string;
}

export interface DueDiligenceResponse {
  rut: string;
  razonSocial: string;
  tipo: 'cliente' | 'proveedor';
  antecedentes?: Antecedente[];
  recomendaciones?: Recomendacion[];
  score: number;
  fechaConsulta: string;
}

export interface MonitoreoTransaccionalRequest {
  rut?: string;
  monto?: number;
  tipoTransaccion?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  datosAdicionales?: Record<string, unknown>;
}

export interface Irregularidad {
  tipo: string;
  severidad: 'baja' | 'media' | 'alta';
  descripcion: string;
  recomendacion: string;
}

export interface MonitoreoTransaccionalResponse {
  transaccionId?: string;
  rut?: string;
  monto?: number;
  irregularidades?: Irregularidad[];
  riesgo: 'bajo' | 'medio' | 'alto';
  recomendacion: string;
  fechaAnalisis: string;
}

export interface CumplimientoTributarioRequest {
  rut: string;
  periodo: string;
  tipoAuditoria?: 'completa' | 'basica' | 'express';
}

export interface Hallazgo {
  tipo: string;
  descripcion: string;
  severidad: 'informativo' | 'advertencia' | 'critico';
  accionRequerida: string;
}

export interface CumplimientoTributarioResponse {
  rut: string;
  periodo: string;
  tipoAuditoria: string;
  cumplimiento: 'conforme' | 'observaciones' | 'no_conforme';
  hallazgos?: Hallazgo[];
  score: number;
  fechaAuditoria: string;
}

