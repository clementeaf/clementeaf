/**
 * DTO para solicitud de Cumplimiento Tributario
 */
export interface CumplimientoTributarioDto {
  rut: string;
  periodo: string;
  tipoAuditoria?: 'completa' | 'basica' | 'express';
}

