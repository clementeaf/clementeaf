import { useMemo } from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { HomeOrder } from '../types';
import { formatCurrency } from '../../../utils/formatUtils';

interface HomeMetricsSectionProps {
  orders: HomeOrder[];
}

interface TopItem {
  label: string;
  value: number;
}

interface MonthlySalesPoint {
  monthLabel: string;
  soldAmount: number;
  goalAmount: number;
}

/**
 * Card base para métricas del Home.
 * @param props - Props del componente
 * @returns Card de métrica
 */
const MetricsCard = ({ title, children }: { title: string; children: ReactNode }): ReactElement => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-[140px] flex flex-col overflow-hidden">
      <div className="text-xs font-medium text-gray-500 mb-2 truncate">{title}</div>
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

/**
 * Reduce una lista a top N por valor.
 * @param items - Items
 * @param n - Cantidad
 * @returns Top N items
 */
const topN = (items: TopItem[], n: number): TopItem[] => {
  return [...items].sort((a, b) => b.value - a.value).slice(0, n);
};

/**
 * Genera etiqueta de mes "MMM YYYY" en es-CL.
 * @param date - Fecha
 * @returns Etiqueta
 */
const formatMonthLabel = (date: Date): string => {
  return date.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' });
};

/**
 * Construye serie mock de 5 meses para vendido vs meta.
 * @param now - Fecha actual
 * @returns Serie mensual
 */
const buildMockMonthlySeries = (now: Date): MonthlySalesPoint[] => {
  const points: MonthlySalesPoint[] = [];
  for (let i = 4; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const goalAmount = 12_000_000;
    const soldAmount = 6_500_000 + (4 - i) * 950_000;
    points.push({
      monthLabel: formatMonthLabel(d),
      goalAmount,
      soldAmount
    });
  }
  return points;
};

/**
 * Calcula top vendedores y clientes por monto desde órdenes.
 * @param orders - Órdenes
 * @returns Top vendedores, top clientes
 */
const calculateTopFromOrders = (orders: HomeOrder[]): { topVendors: TopItem[]; topCustomers: TopItem[] } => {
  const vendorTotals: Record<string, number> = {};
  const customerTotals: Record<string, number> = {};

  for (const o of orders) {
    const vendorKey = o.vendedor?.trim().length ? o.vendedor.trim() : 'Sin asignar';
    const customerKey = o.cliente?.trim().length ? o.cliente.trim() : 'Sin cliente';
    vendorTotals[vendorKey] = (vendorTotals[vendorKey] ?? 0) + (o.monto ?? 0);
    customerTotals[customerKey] = (customerTotals[customerKey] ?? 0) + (o.monto ?? 0);
  }

  const topVendors = topN(Object.entries(vendorTotals).map(([label, value]) => ({ label, value })), 5);
  const topCustomers = topN(Object.entries(customerTotals).map(([label, value]) => ({ label, value })), 5);

  return { topVendors, topCustomers };
};

/**
 * Componente de métricas para la vista Tabla del Home.
 * @param props - Props del componente
 * @returns Sección de métricas
 */
export const HomeMetricsSection = ({ orders }: HomeMetricsSectionProps): ReactElement => {
  const now = useMemo(() => new Date(), []);

  const derived = useMemo(() => calculateTopFromOrders(orders), [orders]);
  const monthlySeries = useMemo(() => buildMockMonthlySeries(now), [now]);

  const currentMonth = monthlySeries[monthlySeries.length - 1];
  const progress = currentMonth.goalAmount > 0
    ? Math.min(1, Math.max(0, currentMonth.soldAmount / currentMonth.goalAmount))
    : 0;

  const topProductsMock: TopItem[] = [
    { label: 'Toalla 500gsm', value: 148 },
    { label: 'Sábanas 300TC', value: 121 },
    { label: 'Bata Hotel', value: 98 },
    { label: 'Almohada Premium', value: 84 },
    { label: 'Protector colchón', value: 73 }
  ];

  const topClientsLeastDebtMock: TopItem[] = [
    { label: 'Hotel Andino', value: 120_000 },
    { label: 'Clínica Norte', value: 85_000 },
    { label: 'Residencial Mar', value: 62_500 },
    { label: 'Hostal Centro', value: 45_000 },
    { label: 'Spa Cordillera', value: 30_000 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
      <MetricsCard title="Top 5 vendedores (más ventas)">
        <div className="space-y-1.5">
          {(derived.topVendors.length ? derived.topVendors : topN([{ label: 'Vendedor A', value: 5_200_000 }], 1)).slice(0, 5).map((it, idx) => (
            <div key={`${it.label}-${idx}`} className="flex items-center justify-between gap-3">
              <div className="text-xs text-gray-900 truncate">{idx + 1}. {it.label}</div>
              <div className="text-xs font-medium text-gray-900 whitespace-nowrap">{formatCurrency(it.value)}</div>
            </div>
          ))}
        </div>
      </MetricsCard>

      <MetricsCard title="Monto vendido vs Meta mensual (últimos 5 meses)">
        <div className="w-full">
          <div className="grid grid-cols-2 gap-3 pb-2 border-b border-gray-200">
            <div className="text-[11px] font-semibold text-gray-700">Vendido</div>
            <div className="text-[11px] font-semibold text-gray-700 text-right">Meta</div>
          </div>

          <div className="pt-2 space-y-1.5">
            {monthlySeries.map((p) => (
              <div key={p.monthLabel} className="grid grid-cols-2 gap-3 items-center">
                <div className="min-w-0">
                  <div className="text-[10px] text-gray-500 truncate">{p.monthLabel}</div>
                  <div className="text-xs font-medium text-gray-900 truncate">{formatCurrency(p.soldAmount)}</div>
                </div>
                <div className="text-right min-w-0">
                  <div className="text-[10px] text-gray-500 truncate">{p.monthLabel}</div>
                  <div className="text-xs font-medium text-gray-900 truncate">{formatCurrency(p.goalAmount)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MetricsCard>

      <MetricsCard title="Top 5 productos (más ventas)">
        <div className="space-y-1.5">
            {topProductsMock.map((it, idx) => (
              <div key={it.label} className="flex items-center justify-between gap-3">
                <div className="text-xs text-gray-900 truncate">{idx + 1}. {it.label}</div>
                <div className="text-xs font-medium text-gray-900 whitespace-nowrap">{it.value.toLocaleString('es-CL')}</div>
              </div>
            ))}
          </div>
      </MetricsCard>

      <MetricsCard title="Top 5 clientes (más compran)">
        <div className="space-y-1.5">
            {(derived.topCustomers.length ? derived.topCustomers : topN([{ label: 'Cliente A', value: 4_800_000 }], 1)).slice(0, 5).map((it, idx) => (
              <div key={`${it.label}-${idx}`} className="flex items-center justify-between gap-3">
                <div className="text-xs text-gray-900 truncate">{idx + 1}. {it.label}</div>
                <div className="text-xs font-medium text-gray-900 whitespace-nowrap">{formatCurrency(it.value)}</div>
              </div>
            ))}
          </div>
      </MetricsCard>

      <MetricsCard title="Top 5 clientes (menos deuda)">
        <div className="space-y-1.5">
            {topClientsLeastDebtMock.map((it, idx) => (
              <div key={it.label} className="flex items-center justify-between gap-3">
                <div className="text-xs text-gray-900 truncate">{idx + 1}. {it.label}</div>
                <div className="text-xs font-medium text-gray-900 whitespace-nowrap">{formatCurrency(it.value)}</div>
              </div>
            ))}
          </div>
      </MetricsCard>
    </div>
  );
};


