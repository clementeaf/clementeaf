import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button } from '../../components/commons';
import { productsService, type Product } from '../../services/productsService';

/**
 * Props del modal de confirmación de eliminación
 */
interface DeleteProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Modal para eliminar (soft delete) un producto del catálogo
 */
export const DeleteProductModal = ({
  isOpen,
  product,
  onClose,
  onSuccess
}: DeleteProductModalProps): React.ReactElement => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!product) {
        throw new Error('Producto no seleccionado');
      }
      return await productsService.deleteCatalogProduct(product.id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ queryKey: ['products', 'search'] });
      onSuccess?.();
      onClose();
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Eliminar Producto" size="md">
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          ¿Confirmas eliminar este producto del catálogo?
        </p>
        {product && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-900 font-medium">
              {product.codigo} - {product.nombre}
            </p>
            {product.sku && <p className="text-xs text-gray-600 mt-1">SKU: {product.sku}</p>}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !product}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};


