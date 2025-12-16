import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input, Toggle } from '../../components/commons';
import { productsService, type CreateCatalogProductDto, type UpdateCatalogProductDto, type Product } from '../../services/productsService';

/**
 * Modo del formulario de producto
 */
export type ProductFormMode = 'create' | 'edit';

/**
 * Props del modal de producto
 */
interface ProductFormModalProps {
  isOpen: boolean;
  mode: ProductFormMode;
  product: Product | null;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Modal para crear/editar productos del catálogo
 */
export const ProductFormModal = ({
  isOpen,
  mode,
  product,
  onClose,
  onSuccess
}: ProductFormModalProps): React.ReactElement => {
  const queryClient = useQueryClient();

  const [codigo, setCodigo] = useState<string>('');
  const [nombre, setNombre] = useState<string>('');
  const [sku, setSku] = useState<string>('');
  const [descontinuado, setDescontinuado] = useState<boolean>(false);
  const [descontinuadoReason, setDescontinuadoReason] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const title = useMemo(() => {
    return mode === 'create' ? 'Nuevo Producto' : 'Editar Producto';
  }, [mode]);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && product) {
      setCodigo(product.codigo ?? '');
      setNombre(product.nombre ?? '');
      setSku(product.sku ?? '');
      setDescontinuado(Boolean(product.descontinuado));
      setDescontinuadoReason('');
    } else {
      setCodigo('');
      setNombre('');
      setSku('');
      setDescontinuado(false);
      setDescontinuadoReason('');
    }
    setErrors({});
  }, [isOpen, mode, product]);

  /**
   * Valida el formulario
   * @returns true si es válido
   */
  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!codigo.trim()) nextErrors.codigo = 'El código es requerido';
    if (!nombre.trim()) nextErrors.nombre = 'El nombre es requerido';
    if (descontinuado && descontinuadoReason.trim().length > 500) {
      nextErrors.descontinuadoReason = 'El motivo no puede superar 500 caracteres';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!validate()) {
        throw new Error('Formulario inválido');
      }

      if (mode === 'create') {
        const dto: CreateCatalogProductDto = {
          codigo: codigo.trim(),
          nombre: nombre.trim(),
          sku: sku.trim() ? sku.trim() : null,
          descontinuado,
          descontinuadoReason: descontinuado ? (descontinuadoReason.trim() ? descontinuadoReason.trim() : null) : null
        };
        return await productsService.createCatalogProduct(dto);
      }

      if (!product) {
        throw new Error('Producto no seleccionado');
      }

      const dto: UpdateCatalogProductDto = {
        codigo: codigo.trim(),
        nombre: nombre.trim(),
        sku: sku.trim() ? sku.trim() : null,
        descontinuado,
        descontinuadoReason: descontinuado ? (descontinuadoReason.trim() ? descontinuadoReason.trim() : null) : null
      };
      return await productsService.updateCatalogProduct(product.id, dto);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ queryKey: ['products', 'search'] });
      onSuccess?.();
      onClose();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Error guardando producto';
      setErrors(prev => ({ ...prev, submit: message }));
    }
  });

  /**
   * Maneja el submit del formulario
   * @param e - Evento submit
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    mutation.mutate();
  };

  const isSubmitting = mutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="product-codigo"
            label="Código"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            error={errors.codigo}
            required
          />
          <Input
            id="product-sku"
            label="SKU"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />
        </div>

        <Input
          id="product-nombre"
          label="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          error={errors.nombre}
          required
        />

        <div className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Descontinuado</p>
            <p className="text-xs text-gray-500">Se puede vender stock existente, pero se considera fuera de catálogo activo</p>
          </div>
          <Toggle
            id="product-descontinuado"
            checked={descontinuado}
            onChange={(e) => setDescontinuado(e.target.checked)}
            label=""
          />
        </div>

        {descontinuado && (
          <div className="flex flex-col">
            <label htmlFor="product-descontinuado-reason" className="text-sm font-medium text-gray-700 mb-2">
              Motivo (opcional)
            </label>
            <textarea
              id="product-descontinuado-reason"
              value={descontinuadoReason}
              onChange={(e) => setDescontinuadoReason(e.target.value)}
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004BB7] focus:border-transparent ${
                errors.descontinuadoReason ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={500}
            />
            {errors.descontinuadoReason && <span className="mt-1 text-sm text-red-600">{errors.descontinuadoReason}</span>}
          </div>
        )}

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        )}

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
            disabled={isSubmitting}
            className="px-4 py-2 text-white bg-[#004BB7] rounded-lg hover:bg-[#003a8f] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};


