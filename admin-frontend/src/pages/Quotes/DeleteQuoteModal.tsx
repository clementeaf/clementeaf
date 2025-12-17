import { Modal, Button } from '../../components/commons';
import type { QuoteRow } from './columns';

interface DeleteQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: QuoteRow | null;
  onConfirm: (quote: QuoteRow) => void;
  isLoading: boolean;
}

/**
 * Modal de confirmación para eliminar una orden de compra (nota de venta).
 */
export const DeleteQuoteModal = ({
  isOpen,
  onClose,
  quote,
  onConfirm,
  isLoading
}: DeleteQuoteModalProps): React.ReactElement => {
  if (!quote) return <Modal isOpen={isOpen} onClose={onClose} title="Eliminar orden"><div /></Modal>;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Eliminar orden de compra" size="sm">
      <div className="space-y-4">
        <div className="text-sm text-gray-700">
          ¿Seguro que deseas eliminar la orden <strong>{quote.numeroCotizacion}</strong> de{' '}
          <strong>{quote.clienteNombre}</strong>? Esta acción no se puede deshacer.
        </div>

        <div className="flex justify-end gap-2">
          <Button
            onClick={onClose}
            className="px-3 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 text-xs"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => onConfirm(quote)}
            className="px-3 py-2 bg-red-600 text-white hover:bg-red-700 text-xs"
            disabled={isLoading}
          >
            {isLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};


