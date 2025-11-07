import { useState } from 'react';
import type { BillRow } from '../Inicio/columns';
import type { ClaimFormData } from './types';

/**
 * Props del componente CreateClaimForm
 */
interface CreateClaimFormProps {
  /**
   * Facturas disponibles
   */
  bills: BillRow[];
  /**
   * Función para crear el reclamo
   */
  onSubmit: (formData: ClaimFormData) => void;
  /**
   * Función para cancelar
   */
  onCancel: () => void;
}

/**
 * Componente para crear un reclamo
 * @param props - Props del componente CreateClaimForm
 * @returns Componente CreateClaimForm
 */
export const CreateClaimForm = ({
  bills,
  onSubmit,
  onCancel
}: CreateClaimFormProps): React.ReactElement => {
  const [selectedBillId, setSelectedBillId] = useState<string>('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [description, setDescription] = useState<string>('');

  const selectedBill = bills.find((bill) => bill.id === selectedBillId);
  const availableProducts = selectedBill?.products || [];

  const handleBillChange = (billId: string): void => {
    setSelectedBillId(billId);
    setSelectedProductIds([]);
  };

  const handleProductToggle = (productId: string): void => {
    setSelectedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const handleSelectAll = (): void => {
    if (availableProducts.length === 0) {
      return;
    }
    if (selectedProductIds.length === availableProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(availableProducts.map((p) => p.id));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!selectedBillId || selectedProductIds.length === 0 || !description.trim()) {
      return;
    }
    onSubmit({
      billId: selectedBillId,
      productIds: selectedProductIds,
      description: description.trim()
    });
  };

  const isFormValid = selectedBillId !== '' && selectedProductIds.length > 0 && description.trim() !== '';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <label htmlFor="bill" className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Factura
        </label>
        <select
          id="bill"
          value={selectedBillId}
          onChange={(e) => handleBillChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-book text-black-900"
        >
          <option value="">Seleccione una factura</option>
          {bills.map((bill) => (
            <option key={bill.id} value={bill.id}>
              {bill.number} - {new Date(bill.purchaseDate).toLocaleDateString('es-CL')}
            </option>
          ))}
        </select>
      </div>

      {selectedBill && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Seleccionar Productos
            </label>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {selectedProductIds.length === availableProducts.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
            </button>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
            {availableProducts.length === 0 ? (
              <p className="text-sm text-gray-500">No hay productos disponibles en esta factura</p>
            ) : (
              <div className="flex flex-col gap-2">
                {availableProducts.map((product) => (
                  <label
                    key={product.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(product.id)}
                      onChange={() => handleProductToggle(product.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-black-900">{product.name}</span>
                      <div className="text-xs text-gray-600">
                        Cantidad: {product.quantity} | Precio: {new Intl.NumberFormat('es-CL', {
                          style: 'currency',
                          currency: 'CLP'
                        }).format(product.unitPrice)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Descripción del Reclamo
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-book text-black-900 resize-none"
          placeholder="Describe el problema o motivo del reclamo..."
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!isFormValid}
          className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 ${
            isFormValid
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Crear Reclamo
        </button>
      </div>
    </form>
  );
};

