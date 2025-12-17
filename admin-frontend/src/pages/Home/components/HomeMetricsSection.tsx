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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-h-[140px]">
      <div className="text-xs font-medium text-gray-500 mb-2">{title}</div>
      {children}
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
    <div className="flex flex-nowrap gap-4 overflow-x-auto pb-2 mb-4">
      <div className="min-w-[260px] flex-shrink-0">
        <MetricsCard title="Top 5 vendedores (más ventas)">
        <div className="space-y-2">
          {(derived.topVendors.length ? derived.topVendors : topN([{ label: 'Vendedor A', value: 5_200_000 }], 1)).slice(0, 5).map((it, idx) => (
            <div key={`${it.label}-${idx}`} className="flex items-center justify-between gap-3">
              <div className="text-sm text-gray-900 truncate">{idx + 1}. {it.label}</div>
              <div className="text-sm font-medium text-gray-900">{formatCurrency(it.value)}</div>
            </div>
          ))}
        </div>
        </MetricsCard>
      </div>

      <div className="min-w-[520px] flex-shrink-0">
        <MetricsCard title="Monto vendido vs Meta mensual (últimos 5 meses)">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-2xl font-semibold text-gray-900">{formatCurrency(currentMonth.soldAmount)}</div>
              <div className="text-xs text-gray-500">Meta: {formatCurrency(currentMonth.goalAmount)} ({currentMonth.monthLabel})</div>
            </div>
            <div className="text-xs text-gray-500 text-right">
              {(progress * 100).toFixed(0)}% de la meta
            </div>
          </div>

          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-2 bg-[#0052C9]" style={{ width: `${progress * 100}%` }} />
          </div>

          <div className="mt-4 grid grid-cols-5 gap-2">
            {monthlySeries.map((p) => (
              <div key={p.monthLabel} className="text-[11px] text-gray-600">
                <div className="truncate">{p.monthLabel}</div>
                <div className="font-medium text-gray-900">{formatCurrency(p.soldAmount)}</div>
              </div>
            ))}
          </div>
        </MetricsCard>
      </div>

      <div className="min-w-[260px] flex-shrink-0">
        <MetricsCard title="Top 5 productos (más ventas)">
          <div className="space-y-2">
            {topProductsMock.map((it, idx) => (
              <div key={it.label} className="flex items-center justify-between gap-3">
                <div className="text-sm text-gray-900 truncate">{idx + 1}. {it.label}</div>
                <div className="text-sm font-medium text-gray-900">{it.value.toLocaleString('es-CL')}</div>
              </div>
            ))}
          </div>
        </MetricsCard>
      </div>

      <div className="min-w-[260px] flex-shrink-0">
        <MetricsCard title="Top 5 clientes (más compran)">
          <div className="space-y-2">
            {(derived.topCustomers.length ? derived.topCustomers : topN([{ label: 'Cliente A', value: 4_800_000 }], 1)).slice(0, 5).map((it, idx) => (
              <div key={`${it.label}-${idx}`} className="flex items-center justify-between gap-3">
                <div className="text-sm text-gray-900 truncate">{idx + 1}. {it.label}</div>
                <div className="text-sm font-medium text-gray-900">{formatCurrency(it.value)}</div>
              </div>
            ))}
          </div>
        </MetricsCard>
      </div>

      <div className="min-w-[260px] flex-shrink-0">
        <MetricsCard title="Top 5 clientes (menos deuda)">
          <div className="space-y-2">
            {topClientsLeastDebtMock.map((it, idx) => (
              <div key={it.label} className="flex items-center justify-between gap-3">
                <div className="text-sm text-gray-900 truncate">{idx + 1}. {it.label}</div>
                <div className="text-sm font-medium text-gray-900">{formatCurrency(it.value)}</div>
              </div>
            ))}
          </div>
        </MetricsCard>
      </div>
    </div>
  );
};


