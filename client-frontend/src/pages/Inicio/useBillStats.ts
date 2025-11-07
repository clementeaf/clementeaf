import { useMemo } from 'react';
import type { BillRow } from './columns';

/**
 * Estadísticas calculadas de las facturas
 */
export interface BillStats {
  /**
   * Total de facturas
   */
  totalBills: number;
  /**
   * Monto total de todas las facturas
   */
  totalAmount: number;
  /**
   * Monto pendiente (facturas por pagar)
   */
  pendingAmount: number;
  /**
   * Monto pagado (facturas pagadas)
   */
  paidAmount: number;
  /**
   * Cantidad de facturas pendientes
   */
  pendingCount: number;
  /**
   * Cantidad de facturas pagadas
   */
  paidCount: number;
  /**
   * Promedio por factura
   */
  averageAmount: number;
  /**
   * Tasa de pago (porcentaje)
   */
  paymentRate: number;
}

/**
 * Hook para calcular estadísticas de facturas
 * @param bills - Array de facturas
 * @returns Estadísticas calculadas
 */
export const useBillStats = (bills: BillRow[]): BillStats => {
  return useMemo(() => {
    const totalBills = bills.length;
    const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const pendingBills = bills.filter((bill) => bill.paymentStatus === 'Por pagar');
    const paidBills = bills.filter((bill) => bill.paymentStatus === 'Pagado');
    const pendingAmount = pendingBills.reduce((sum, bill) => sum + bill.amount, 0);
    const paidAmount = paidBills.reduce((sum, bill) => sum + bill.amount, 0);
    const pendingCount = pendingBills.length;
    const paidCount = paidBills.length;
    const averageAmount = totalBills > 0 ? totalAmount / totalBills : 0;
    const paymentRate = totalBills > 0 ? (paidCount / totalBills) * 100 : 0;

    return {
      totalBills,
      totalAmount,
      pendingAmount,
      paidAmount,
      pendingCount,
      paidCount,
      averageAmount,
      paymentRate
    };
  }, [bills]);
};

