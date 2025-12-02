import { Modal } from '../../../components/commons';
import type { PickingOrder } from '../types';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: PickingOrder;
}

/**
 * Modal para mostrar el detalle de productos de una orden de picking
 * @param props - Props del componente OrderDetailModal
 * @returns Componente OrderDetailModal
 */
export const OrderDetailModal = ({ isOpen, onClose, order }: OrderDetailModalProps): React.ReactElement => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle de orden: ${order.codigoOrden}`}
      contentClassName="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Información de la orden */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500">Vendedor</label>
              <p className="text-sm font-medium text-gray-900 mt-1">{order.vendedor}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Cantidad de productos</label>
              <p className="text-sm font-medium text-gray-900 mt-1">{order.cantidadProductos}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Estado</label>
              <p className="text-sm font-medium text-gray-900 mt-1">{order.estado}</p>
            </div>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-700 uppercase tracking-wider py-3 px-4">
                  Nombre del producto
                </th>
                <th className="text-left text-xs font-medium text-gray-700 uppercase tracking-wider py-3 px-4">
                  Código del producto
                </th>
                <th className="text-left text-xs font-medium text-gray-700 uppercase tracking-wider py-3 px-4">
                  Ubicación
                </th>
                <th className="text-left text-xs font-medium text-gray-700 uppercase tracking-wider py-3 px-4">
                  Stock
                </th>
                <th className="text-left text-xs font-medium text-gray-700 uppercase tracking-wider py-3 px-4">
                  Cantidad Solicitada
                </th>
              </tr>
            </thead>
            <tbody>
              {order.productos.length > 0 ? (
                order.productos.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-900">{product.nombre}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{product.codigo}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{product.ubicacion}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{product.stock}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{product.cantidadSolicitada}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-sm text-gray-500">
                    No hay productos en esta orden
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};

