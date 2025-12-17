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
 * Extrae mensaje legible desde error Axios u objeto genérico.
 * @param error - Error capturado
 * @returns Mensaje de error
 */
const getApiErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object') {
    const maybeAxios = error as { response?: { data?: unknown } };
    const data = maybeAxios.response?.data;
    if (data && typeof data === 'object') {
      const d = data as { message?: unknown; error?: unknown };
      if (typeof d.message === 'string' && d.message.trim().length > 0) return d.message;
      if (typeof d.error === 'string' && d.error.trim().length > 0) return d.error;
    }
    if (typeof (error as { message?: unknown }).message === 'string') {
      return (error as { message: string }).message;
    }
  }
  return 'Error desconocido';
};

/**
 * Espera un tiempo en ms.
 * @param ms - Milisegundos
 */
const sleep = async (ms: number): Promise<void> =>
  await new Promise((resolve) => setTimeout(resolve, ms));

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
  /**
   * Ejecuta aprobar si falta.
   */
  const approveIfNeeded = async (): Promise<void> => {
    if (!quoteId) return;
    setStep('approving');
    // approveQuote es idempotente en backend; podemos llamarlo siempre para asegurar reservas
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
   * Emite la factura con reintentos si aún no existen reservas (eventual consistencia del evento quote.approved).
   */
  const issueInvoiceWithRetry = async (): Promise<void> => {
    const maxAttempts = 6;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await issueInvoice();
        return;
      } catch (e: unknown) {
        const msg = getApiErrorMessage(e);
        const isNoReservas = msg.toLowerCase().includes('no se encontraron reservas');
        const isNotConfirmed = msg.toLowerCase().includes('debe estar en estado') && msg.toLowerCase().includes('confirmado');

        // Reintento: esperar a que se creen reservas por EventBridge
        if (isNoReservas && attempt < maxAttempts) {
          setError(`Esperando reservas... reintentando (${attempt}/${maxAttempts})`);
          await sleep(1500);
          continue;
        }
        // Reintento: asegurar confirmado (por si el update no se aplicó)
        if (isNotConfirmed && attempt < maxAttempts) {
          await ensurePickingConfirmed();
          await sleep(300);
          continue;
        }
        throw e;
      }
    }
  };

  /**
   * Acción principal: intenta dejar la nota lista y emitir factura.
   */
  const handleGenerate = async (): Promise<void> => {
    setError(null);
    try {
      await approveIfNeeded();
      await ensurePickingConfirmed();
      await issueInvoiceWithRetry();
      onCompleted();
      onClose();
    } catch (e: unknown) {
      const msg = getApiErrorMessage(e);
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


