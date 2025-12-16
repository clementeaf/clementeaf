import { useMemo } from 'react';
import { Modal, Button } from '../../../components/commons';
import type { PickingOrder } from '../types';
import { quotesService } from '../../../services/quotesService';
import { whatsappService } from '../../../services/whatsappService';
import { emailService } from '../../../services/emailService';

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
  const quoteId = useMemo(() => {
    const id = parseInt(order.id, 10);
    return isNaN(id) ? null : id;
  }, [order.id]);

  const buildPrintableHtml = (data: {
    invoiceNumber: string;
    issueDate: string | null;
    clienteNombre: string;
    items: Array<{ productCode: string; productName: string; quantity: number; unitPrice: number; lineTotal: number }>;
    netAmount: number;
    taxAmount: number;
    totalAmount: number;
  }): string => {
    const fmt = (n: number) => `$${n.toLocaleString('es-CL')}`;
    const date = data.issueDate ? new Date(data.issueDate).toLocaleDateString('es-CL') : '-';
    const rows = data.items
      .map(
        (it) => `
        <tr>
          <td>${it.productCode}</td>
          <td>${it.productName}</td>
          <td style="text-align:right;">${it.quantity}</td>
          <td style="text-align:right;">${fmt(it.unitPrice)}</td>
          <td style="text-align:right;">${fmt(it.lineTotal)}</td>
        </tr>
      `
      )
      .join('');

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${data.invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; }
    h1 { margin: 0 0 8px 0; }
    .meta { margin: 0 0 16px 0; color: #444; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
    th { background: #f5f5f5; text-align: left; }
    .totals { margin-top: 16px; width: 320px; margin-left: auto; }
    .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>Factura ${data.invoiceNumber}</h1>
  <div class="meta"><strong>Cliente:</strong> ${data.clienteNombre} &nbsp; | &nbsp; <strong>Fecha:</strong> ${date}</div>
  <table>
    <thead>
      <tr>
        <th>Código</th>
        <th>Producto</th>
        <th style="text-align:right;">Cantidad</th>
        <th style="text-align:right;">Precio</th>
        <th style="text-align:right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
  <div class="totals">
    <div><span>Neto</span><span>${fmt(data.netAmount)}</span></div>
    <div><span>IVA (19%)</span><span>${fmt(data.taxAmount)}</span></div>
    <div style="font-weight:bold;"><span>Total</span><span>${fmt(data.totalAmount)}</span></div>
  </div>
</body>
</html>`;
  };

  const handlePrintInvoice = async (): Promise<void> => {
    if (!quoteId) return;
    const quote = await quotesService.getQuoteById(quoteId, { includeInvoice: true, includeInvoiceXml: false });
    if (!quote?.invoice) {
      alert('Esta orden aún no tiene factura emitida.');
      return;
    }
    const items =
      quote.invoiceItems && quote.invoiceItems.length > 0
        ? quote.invoiceItems
        : [];

    const html = buildPrintableHtml({
      invoiceNumber: quote.invoice.invoiceNumber,
      issueDate: quote.invoice.issueDate ?? null,
      clienteNombre: quote.clienteNombre,
      items: items.map(i => ({
        productCode: i.productCode,
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        lineTotal: i.lineTotal
      })),
      netAmount: quote.invoice.netAmount,
      taxAmount: quote.invoice.taxAmount,
      totalAmount: quote.invoice.totalAmount
    });

    const w = window.open('', '_blank', 'noopener,noreferrer');
    if (!w) {
      alert('Bloqueador de popups: permite abrir ventanas para imprimir.');
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  const handleSendWhatsApp = async (): Promise<void> => {
    if (!quoteId) return;
    const to = window.prompt('Número WhatsApp destino (ej: +569XXXXXXXX):');
    if (!to) return;
    const quote = await quotesService.getQuoteById(quoteId, { includeInvoice: true, includeInvoiceXml: false });
    if (!quote?.invoice) {
      alert('Esta orden aún no tiene factura emitida.');
      return;
    }
    const msg = [
      `Factura ${quote.invoice.invoiceNumber}`,
      `Cliente: ${quote.clienteNombre}`,
      `Total: $${quote.invoice.totalAmount.toLocaleString('es-CL')}`,
      `Nota: ${quote.numeroCotizacion || `Q-${quote.id}`}`,
      '',
      'Puedes solicitar el XML desde el portal (Contabilidad / Picking).'
    ].join('\n');
    await whatsappService.sendMessage(to, msg);
    alert('Enviado por WhatsApp (si el servicio está conectado).');
  };

  const handleSendEmail = async (): Promise<void> => {
    if (!quoteId) return;
    const to = window.prompt('Email destino:');
    if (!to) return;
    const quote = await quotesService.getQuoteById(quoteId, { includeInvoice: true, includeInvoiceXml: true });
    if (!quote?.invoice) {
      alert('Esta orden aún no tiene factura emitida.');
      return;
    }
    const subject = `Factura ${quote.invoice.invoiceNumber} - ${quote.clienteNombre}`;
    const xml = quote.invoice.xml ? `<pre style="white-space:pre-wrap;font-size:11px;border:1px solid #eee;padding:12px;">${quote.invoice.xml.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>` : '<p>(Sin XML)</p>';
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height:1.5">
        <h2>Factura ${quote.invoice.invoiceNumber}</h2>
        <p><strong>Cliente:</strong> ${quote.clienteNombre}</p>
        <p><strong>Total:</strong> $${quote.invoice.totalAmount.toLocaleString('es-CL')}</p>
        <p><strong>IVA (19%):</strong> $${quote.invoice.taxAmount.toLocaleString('es-CL')}</p>
        <h3>XML</h3>
        ${xml}
      </div>
    `;
    await emailService.sendEmail({
      to,
      subject,
      body: `Factura ${quote.invoice.invoiceNumber} - Total $${quote.invoice.totalAmount.toLocaleString('es-CL')}`,
      htmlBody
    });
    alert('Email enviado (si SES está configurado).');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle de orden: ${order.codigoOrden}`}
      contentClassName="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Acciones de factura */}
        <div className="flex gap-2 justify-end">
          <Button
            onClick={handlePrintInvoice}
            className="px-3 py-2 bg-[#0052C9] text-white hover:bg-[#004BB7] text-xs"
            disabled={!quoteId}
          >
            Imprimir factura
          </Button>
          <Button
            onClick={handleSendWhatsApp}
            className="px-3 py-2 bg-green-600 text-white hover:bg-green-700 text-xs"
            disabled={!quoteId}
          >
            Enviar WhatsApp
          </Button>
          <Button
            onClick={handleSendEmail}
            className="px-3 py-2 bg-gray-800 text-white hover:bg-black text-xs"
            disabled={!quoteId}
          >
            Enviar Email
          </Button>
        </div>

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

