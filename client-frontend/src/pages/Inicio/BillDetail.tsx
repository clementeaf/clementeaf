import { Table } from '../../components/table';
import type { BillRow } from './columns';
import { productColumns } from './productColumns';

/**
 * Props del componente BillDetail
 */
interface BillDetailProps {
  /**
   * Datos de la factura
   */
  bill: BillRow;
}

/**
 * Componente para mostrar el detalle de una factura (tabla de productos)
 * @param props - Props del componente BillDetail
 * @returns Componente BillDetail
 */
export const BillDetail = ({ bill }: BillDetailProps): React.ReactElement => {
  return (
    <div className="p-4">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table
          data={bill.products}
          columns={productColumns}
          enableSorting={true}
          containerClassName="w-full"
          tableClassName="w-full border-collapse"
          theadClassName="bg-gray-50"
          headerRowClassName="border-b border-gray-200"
          headerCellClassName="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
          bodyRowClassName="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
          bodyCellClassName="px-4 py-3 text-sm text-gray-900"
        />
      </div>
    </div>
  );
};

