import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input, Select, InputNumber } from '../../components/commons';
import { stockMovementsService, MovementType, type CreateMovementDto } from '../../services/stockMovementsService';
import { warehousesService, type Warehouse } from '../../services/warehousesService';
import type { Product } from '../../services/productsService';
import { useCurrentUser } from '../../hooks/useAuth';

/**
 * Props del modal para crear movimientos
 */
interface CreateMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  warehouses: Warehouse[];
  onSuccess?: () => void;
}

/**
 * Modal para crear movimientos de stock
 */
export const CreateMovementModal = ({
  isOpen,
  onClose,
  product,
  warehouses,
  onSuccess
}: CreateMovementModalProps): React.ReactElement => {
  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const [movementType, setMovementType] = useState<MovementType>(MovementType.ENTRADA);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState<number>(0);
  const [documento, setDocumento] = useState<string>('');
  const [numeroDocumento, setNumeroDocumento] = useState<string>('');
  const [fechaDocumento, setFechaDocumento] = useState<string>('');
  const [lote, setLote] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Resetear formulario cuando se abre/cierra
  useEffect(() => {
    if (isOpen) {
      setMovementType(MovementType.ENTRADA);
      setWarehouseId(null);
      setCantidad(0);
      setDocumento('');
      setNumeroDocumento('');
      setFechaDocumento('');
      setLote('');
      setObservaciones('');
      setErrors({});
    }
  }, [isOpen]);

  // Mutación para crear movimiento
  const createMovementMutation = useMutation({
    mutationFn: async (dto: CreateMovementDto) => {
      return await stockMovementsService.createMovement(dto);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['productHistory'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'search'] });
      
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      console.error('Error al crear movimiento:', error);
      // Si el error es de stock insuficiente, mostrarlo específicamente
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al crear el movimiento. Intenta nuevamente.';
      setErrors({ submit: errorMessage });
    }
  });

  /**
   * Valida el formulario
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!warehouseId) {
      newErrors.warehouseId = 'La bodega es requerida';
    }

    if (!cantidad || cantidad <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    }

    if (movementType === MovementType.SALIDA && product?.stock !== undefined && cantidad > product.stock) {
      newErrors.cantidad = `No hay suficiente stock. Stock disponible: ${product.stock.toLocaleString('es-CL')}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    if (!product || !validateForm()) {
      return;
    }

    const dto: CreateMovementDto = {
      productId: product.codigo || product.id?.toString() || '',
      productCode: product.codigo,
      productName: product.nombre,
      warehouseId: warehouseId!,
      type: movementType,
      cantidad,
      documento: documento || undefined,
      numeroDocumento: numeroDocumento || undefined,
      fechaDocumento: fechaDocumento || undefined,
      lote: lote || undefined,
      observaciones: observaciones || undefined,
      createdBy: currentUser?.id
    };

    createMovementMutation.mutate(dto);
  };

  const typeOptions = [
    { value: MovementType.ENTRADA, label: 'Entrada' },
    { value: MovementType.SALIDA, label: 'Salida' },
    { value: MovementType.AJUSTE, label: 'Ajuste' }
  ];

  const warehouseOptions = warehouses.map(w => ({
    value: w.id.toString(),
    label: `${w.codigoCorto || w.codigo} - ${w.nombre}`
  }));

  const isSubmitting = createMovementMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Movimiento de Stock"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Información del producto */}
        {product && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-blue-900">
              Producto: <span className="font-normal">{product.codigo} - {product.nombre}</span>
            </p>
            {product.stock !== undefined && (
              <p className="text-sm text-blue-700 mt-1">
                Stock actual: <span className="font-semibold">{product.stock.toLocaleString('es-CL')}</span>
              </p>
            )}
          </div>
        )}

        {/* Tipo de movimiento */}
        <Select
          id="movement-type"
          label="Tipo de Movimiento"
          value={movementType}
          onChange={(e) => setMovementType(e.target.value as MovementType)}
          options={typeOptions}
          required
          error={errors.movementType}
        />

        {/* Bodega */}
        <Select
          id="warehouse"
          label="Bodega"
          value={warehouseId?.toString() || ''}
          onChange={(e) => setWarehouseId(e.target.value ? parseInt(e.target.value, 10) : null)}
          options={warehouseOptions}
          placeholder="Selecciona una bodega"
          required
          error={errors.warehouseId}
        />

        {/* Cantidad */}
        <InputNumber
          id="cantidad"
          label="Cantidad"
          value={cantidad}
          onChange={(e) => setCantidad(parseFloat(e.target.value) || 0)}
          min={0.01}
          required
          error={errors.cantidad}
        />

        {/* Documento */}
        <Input
          id="documento"
          label="Tipo de Documento"
          value={documento}
          onChange={(e) => setDocumento(e.target.value)}
          placeholder="Ej: OC, NV, AJ"
        />

        {/* Número de documento */}
        <Input
          id="numeroDocumento"
          label="Número de Documento"
          value={numeroDocumento}
          onChange={(e) => setNumeroDocumento(e.target.value)}
          placeholder="Ej: OC-001"
        />

        {/* Fecha de documento */}
        <Input
          id="fechaDocumento"
          label="Fecha de Documento"
          type="date"
          value={fechaDocumento}
          onChange={(e) => setFechaDocumento(e.target.value)}
        />

        {/* Lote */}
        <Input
          id="lote"
          label="Lote"
          value={lote}
          onChange={(e) => setLote(e.target.value)}
          placeholder="Ej: LOTE-001"
        />

        {/* Observaciones */}
        <div className="flex flex-col">
          <label htmlFor="observaciones" className="text-sm font-medium text-gray-700 mb-2">
            Observaciones
          </label>
          <textarea
            id="observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Observaciones adicionales..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004BB7] focus:border-transparent"
          />
        </div>

        {/* Error general */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !product}
            className="px-4 py-2 text-white bg-[#004BB7] rounded-lg hover:bg-[#003a8f] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creando...' : 'Crear Movimiento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

