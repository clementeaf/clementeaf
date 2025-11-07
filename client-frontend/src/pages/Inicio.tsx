import { Table } from '../components/table';
import { columns } from './Inicio/columns';
import { mockBills } from './Inicio/mockData';
import type { BillRow } from './Inicio/columns';

/**
 * Página de Inicio de la aplicación cliente
 * @returns Componente Inicio
 */
export const Inicio = (): React.ReactNode => {
  return (
    <div className="w-full h-full p-6 flex flex-col items-start justify-start gap-8">
      {/* Metrics Cards */}
      <div className="flex items-center justify-between w-full h-[30%]">
        <div className="bg-gray-200 w-[25%] h-full rounded-lg shadow-sm"/>
        <div className="bg-gray-200 w-[25%] h-full rounded-lg shadow-sm"/>
        <div className="bg-gray-200 w-[25%] h-full rounded-lg shadow-sm"/>
      </div>

      {/* Bills Table */}
      <div className="flex-1 flex flex-col min-w-full bg-white rounded-lg shadow-sm p-4 overflow-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Facturas</h2>
        <Table<BillRow>
          data={mockBills}
          columns={columns}
          enableSorting={true}
          containerClassName="w-full"
          tableClassName="w-full border-collapse"
          theadClassName="bg-gray-50 sticky top-0"
          headerRowClassName="border-b border-gray-200"
          headerCellClassName="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
          bodyRowClassName="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
          bodyCellClassName="px-4 py-3 text-sm text-gray-900"
        />
      </div>
    </div>
  );
};

