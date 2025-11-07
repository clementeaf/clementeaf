import { Table } from '../components/table';
import { columns } from './Inicio/columns';
import { mockBills } from './Inicio/mockData';
import { BillDetail } from './Inicio/BillDetail';
import { MetricCard } from './Inicio/MetricCard';
import { useBillStats } from './Inicio/useBillStats';
import type { BillRow } from './Inicio/columns';

/**
 * Página de Inicio de la aplicación cliente
 * @returns Componente Inicio
 */
export const Inicio = (): React.ReactNode => {
  // Test deploy automático
  const stats = useBillStats(mockBills);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="w-full h-full p-6 flex flex-col items-start justify-start gap-8">
      {/* Metrics Cards */}
      <div className="flex items-center justify-between w-full p-2 h-[20%] gap-4">
        <MetricCard
          title="Monto Total"
          value={formatCurrency(stats.totalAmount)}
          subtitle={`${stats.totalBills} factura${stats.totalBills !== 1 ? 's' : ''}`}
        />
        <MetricCard
          title="Monto Pendiente"
          value={formatCurrency(stats.pendingAmount)}
          subtitle={`${stats.pendingCount} factura${stats.pendingCount !== 1 ? 's' : ''} por pagar`}
        />
        <MetricCard
          title="Monto Pagado"
          value={formatCurrency(stats.paidAmount)}
          subtitle={`${stats.paidCount} factura${stats.paidCount !== 1 ? 's' : ''} pagada${stats.paidCount !== 1 ? 's' : ''}`}
        />
        <MetricCard
          title="Promedio por Factura"
          value={formatCurrency(stats.averageAmount)}
          subtitle="Valor promedio"
        />
        <MetricCard
          title="Tasa de Pago"
          value={`${stats.paymentRate.toFixed(1)}%`}
          subtitle={`${stats.paidCount} de ${stats.totalBills} facturas`}
        />
      </div>

      {/* Bills Table */}
      <div className="flex-1 flex flex-col min-w-full bg-white rounded-lg shadow-sm p-4 overflow-auto">
        <Table<BillRow>
          data={mockBills}
          columns={columns}
          enableSorting={true}
          containerClassName="w-full"
          tableClassName="w-full border-collapse"
          theadClassName="bg-gray-50 sticky top-0"
          headerRowClassName="border-b border-gray-200"
          headerCellClassName="px-4 py-3 text-left text-sm font-extrabold text-gray-600 leading-5 tracking-normal"
          bodyRowClassName="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
          bodyCellClassName="px-4 py-3 text-sm font-book text-black-900 leading-5 tracking-normal"
          renderExpandedContent={(bill) => <BillDetail bill={bill} />}
        />
      </div>
    </div>
  );
};

