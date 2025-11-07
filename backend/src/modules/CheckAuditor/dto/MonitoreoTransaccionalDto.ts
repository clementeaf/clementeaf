/**
 * DTO para solicitud de Monitoreo Transaccional
 */
export interface MonitoreoTransaccionalDto {
  rut?: string;
  monto?: number;
  tipoTransaccion?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  datosAdicionales?: Record<string, unknown>;
}

