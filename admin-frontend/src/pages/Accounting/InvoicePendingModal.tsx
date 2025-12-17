import { useEffect, useMemo, useState } from 'react';
import { Modal, Button } from '../../components/commons';
import { quotesService, type PickingStatus } from '../../services/quotesService';
import type { AccountingOverviewRow } from '../../services/accountingService';

interface InvoicePendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  row: AccountingOverviewRow | null;
  onCompleted: () => void;
}

type ModalStep = 'idle' | 'approving' | 'confirming_picking' | 'issuing_invoice';

/**
 * Modal para gestionar el estado de una nota pendiente de factura.
 * Permite aprobar, marcar picking confirmado y emitir factura (confirm-picking).
 */
export const InvoicePendingModal = ({
  isOpen,
  onClose,
  row,
  onCompleted
}: InvoicePendingModalProps): React.ReactElement => {
  const [step, setStep] = useState<ModalStep>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep('idle');
      setError(null);
    }
  }, [isOpen]);

  const quoteId = row?.quote.id ?? null;
  const numero = useMemo(() => {
    if (!row) return '-';
    const n = row.quote.numeroCotizacion;
    return n && n.length > 0 ? n : `Q-${row.quote.id}`;
  }, [row]);

  const estadoPicking = row?.quote.estadoPicking ?? null;
  const hasInvoice = !!row?.invoice?.invoiceNumber;

  /**
   * Determina si una nota ya está aprobada (estado canónico o legacy).
   */
  const isApproved = useMemo(() => {
    const e = row?.quote.estado ?? '';
    return e === 'aprobada' || e === 'Picking' || e === 'Confirmación' || e === 'Despachado';
  }, [row?.quote.estado]);

  /**
   * Ejecuta aprobar si falta.
   */
  const approveIfNeeded = async (): Promise<void> => {
    if (!quoteId) return;
    if (isApproved) return;
    setStep('approving');
    await quotesService.approveQuote(quoteId);
  };

  /**
   * Fuerza estadoPicking a confirmado si no lo está.
   */
  const ensurePickingConfirmed = async (): Promise<void> => {
    if (!quoteId) return;
    const desired: PickingStatus = 'confirmado';
    if (estadoPicking === desired) return;
    setStep('confirming_picking');
    await quotesService.updatePickingStatus(quoteId, desired);
  };

  /**
   * Emite la factura disparando confirmPicking (esto también crea SALIDAS y deja estadoPicking en_ruta).
   */
  const issueInvoice = async (): Promise<void> => {
    if (!quoteId) return;
    setStep('issuing_invoice');
    await quotesService.confirmPicking(quoteId);
  };

  /**
   * Acción principal: intenta dejar la nota lista y emitir factura.
   */
  const handleGenerate = async (): Promise<void> => {
    setError(null);
    try {
      await approveIfNeeded();
      await ensurePickingConfirmed();
      await issueInvoice();
      onCompleted();
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      setError(msg);
      setStep('idle');
    }
  };

  const isBusy = step !== 'idle';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Factura pendiente • ${numero}`}
      size="md"
    >
      {!row ? (
        <div className="text-sm text-gray-700">No hay datos para mostrar.</div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-gray-500">Cliente</div>
                <div className="font-medium text-gray-900">{row.quote.clienteNombre}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Estado Picking</div>
                <div className="font-medium text-gray-900">{row.quote.estadoPicking ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Factura</div>
                <div className="font-medium text-gray-900">
                  {hasInvoice ? row.invoice?.invoiceNumber : 'Pendiente'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Acción</div>
                <div className="font-medium text-gray-900">
                  {hasInvoice ? 'N/A' : 'Generar (confirm-picking)'}
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-600">
            Esta acción ejecuta: <strong>aprobar</strong> (si falta) → <strong>picking confirmado</strong> →{' '}
            <strong>confirm-picking</strong> (crea salidas y emite factura).
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              onClick={onClose}
              className="px-3 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 text-xs"
              disabled={isBusy}
            >
              Cerrar
            </Button>
            <Button
              onClick={handleGenerate}
              className="px-3 py-2 bg-[#0052C9] text-white hover:bg-[#004BB7] text-xs"
              disabled={isBusy || hasInvoice || !quoteId}
            >
              {step === 'approving'
                ? 'Aprobando...'
                : step === 'confirming_picking'
                  ? 'Confirmando picking...'
                  : step === 'issuing_invoice'
                    ? 'Emitiendo factura...'
                    : 'Generar factura'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};


