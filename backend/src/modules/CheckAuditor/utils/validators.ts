import type { DueDiligenceDto } from '../dto/DueDiligenceDto';
import type { MonitoreoTransaccionalDto } from '../dto/MonitoreoTransaccionalDto';
import type { CumplimientoTributarioDto } from '../dto/CumplimientoTributarioDto';

/**
 * Valida formato de RUT chileno
 * @param rut - RUT a validar
 * @returns true si es válido, false si no
 */
const validateRut = (rut: string): boolean => {
  const cleanRut = rut.replace(/[.-]/g, '').toUpperCase();
  if (cleanRut.length < 8 || cleanRut.length > 9) {
    return false;
  }
  
  const rutNumber = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);
  
  if (!/^\d+$/.test(rutNumber)) {
    return false;
  }
  
  if (!/^[\dK]$/.test(dv)) {
    return false;
  }
  
  return true;
};

/**
 * Valida formato de fecha YYYY-MM-DD
 * @param date - Fecha a validar
 * @returns true si es válido, false si no
 */
const validateDateFormat = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }
  
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

/**
 * Valida formato de período (YYYY-MM o YYYY)
 * @param periodo - Período a validar
 * @returns true si es válido, false si no
 */
const validatePeriodo = (periodo: string): boolean => {
  const periodoRegex = /^\d{4}(-\d{2})?$/;
  return periodoRegex.test(periodo);
};

/**
 * Valida DTO de Due Diligence
 * @param dto - DTO a validar
 * @returns Mensaje de error si hay problemas, null si es válido
 */
export const validateDueDiligenceDto = (dto: DueDiligenceDto): string | null => {
  if (!dto.rut || (typeof dto.rut === 'string' && dto.rut.trim() === '')) {
    return 'rut is required';
  }

  if (!dto.tipo || (typeof dto.tipo === 'string' && dto.tipo.trim() === '')) {
    return 'tipo is required';
  }

  if (!validateRut(dto.rut)) {
    return 'Invalid RUT format';
  }

  if (dto.tipo !== 'cliente' && dto.tipo !== 'proveedor') {
    return 'tipo must be either "cliente" or "proveedor"';
  }

  return null;
};

/**
 * Valida DTO de Monitoreo Transaccional
 * @param dto - DTO a validar
 * @returns Mensaje de error si hay problemas, null si es válido
 */
export const validateMonitoreoTransaccionalDto = (dto: MonitoreoTransaccionalDto): string | null => {
  if (dto.rut && !validateRut(dto.rut)) {
    return 'Invalid RUT format';
  }

  if (dto.monto !== undefined && (typeof dto.monto !== 'number' || dto.monto < 0)) {
    return 'monto must be a positive number';
  }

  if (dto.fechaDesde && !validateDateFormat(dto.fechaDesde)) {
    return 'fechaDesde must be in YYYY-MM-DD format';
  }

  if (dto.fechaHasta && !validateDateFormat(dto.fechaHasta)) {
    return 'fechaHasta must be in YYYY-MM-DD format';
  }

  if (dto.fechaDesde && dto.fechaHasta) {
    const desde = new Date(dto.fechaDesde);
    const hasta = new Date(dto.fechaHasta);
    if (desde > hasta) {
      return 'fechaDesde must be before fechaHasta';
    }
  }

  return null;
};

/**
 * Valida DTO de Cumplimiento Tributario
 * @param dto - DTO a validar
 * @returns Mensaje de error si hay problemas, null si es válido
 */
export const validateCumplimientoTributarioDto = (dto: CumplimientoTributarioDto): string | null => {
  if (!dto.rut || (typeof dto.rut === 'string' && dto.rut.trim() === '')) {
    return 'rut is required';
  }

  if (!dto.periodo || (typeof dto.periodo === 'string' && dto.periodo.trim() === '')) {
    return 'periodo is required';
  }

  if (!validateRut(dto.rut)) {
    return 'Invalid RUT format';
  }

  if (!validatePeriodo(dto.periodo)) {
    return 'periodo must be in YYYY-MM or YYYY format';
  }

  if (dto.tipoAuditoria && !['completa', 'basica', 'express'].includes(dto.tipoAuditoria)) {
    return 'tipoAuditoria must be "completa", "basica", or "express"';
  }

  return null;
};

