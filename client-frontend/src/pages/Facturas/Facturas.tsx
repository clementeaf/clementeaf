import { useMemo, useState } from 'react';
import { endpoints } from '../../api/endpoints';

type InvoiceItem = {
  id: number;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type QuoteWithInvoice = {
  id: number;
  clienteNombre: string;
  numeroCotizacion: string | null;
  invoice: {
    id: number;
    invoiceNumber: string;
    issueDate: string | null;
    currency: string;
    netAmount: number;
    taxAmount: number;
    totalAmount: number;
    status: string;
    xml: string | null;
  } | null;
  invoiceItems: InvoiceItem[];
};

export default function Facturas() {
  const [quoteId, setQuoteId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<QuoteWithInvoice | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canPrint = !!data?.invoice && (data.invoiceItems?.length ?? 0) > 0;

  const fetchInvoice = async () => {
    setError(null);
    setData(null);
    const id = parseInt(quoteId, 10);
    if (isNaN(id) || id < 1) {
      setError('Ingresa un ID de nota de venta válido');
      return;
    }

    setLoading(true);
    try {
      const url = endpoints.quotes.getById.replace('{id}', String(id)) + '?includeInvoice=true&includeInvoiceXml=true';
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) {
        setError(json?.message || 'Error obteniendo factura');
        return;
      }
      setData(json.data as QuoteWithInvoice);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const downloadXml = () => {
    if (!data?.invoice?.xml) return;
    const blob = new Blob([data.invoice.xml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.invoice.invoiceNumber}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printableHtml = useMemo(() => {
    if (!data?.invoice) return '';
    const fmt = (n: number) => `$${n.toLocaleString('es-CL')}`;
    const date = data.invoice.issueDate ? new Date(data.invoice.issueDate).toLocaleDateString('es-CL') : '-';
    const rows = (data.invoiceItems || [])
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
<html><head><meta charset="utf-8"/><title>${data.invoice.invoiceNumber}</title>
<style>
body{font-family:Arial,sans-serif;padding:24px;}
table{width:100%;border-collapse:collapse;margin-top:12px;}
th,td{border:1px solid #ddd;padding:8px;font-size:12px;}
th{background:#f5f5f5;text-align:left;}
.totals{margin-top:16px;width:320px;margin-left:auto;}
.totals div{display:flex;justify-content:space-between;padding:4px 0;}
@media print{body{padding:0;}}
</style></head>
<body>
<h1>Factura ${data.invoice.invoiceNumber}</h1>
<div><strong>Cliente:</strong> ${data.clienteNombre} &nbsp; | &nbsp; <strong>Fecha:</strong> ${date}</div>
<table><thead><tr>
<th>Código</th><th>Producto</th><th style="text-align:right;">Cantidad</th><th style="text-align:right;">Precio</th><th style="text-align:right;">Total</th>
</tr></thead><tbody>${rows}</tbody></table>
<div class="totals">
<div><span>Neto</span><span>${fmt(data.invoice.netAmount)}</span></div>
<div><span>IVA (19%)</span><span>${fmt(data.invoice.taxAmount)}</span></div>
<div style="font-weight:bold;"><span>Total</span><span>${fmt(data.invoice.totalAmount)}</span></div>
</div>
</body></html>`;
  }, [data]);

  const print = () => {
    if (!printableHtml) return;
    const w = window.open('', '_blank', 'noopener,noreferrer');
    if (!w) return;
    w.document.open();
    w.document.write(printableHtml);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
      <p className="text-sm text-gray-600 mt-1">Busca una factura por ID de Nota de Venta (Quote)</p>

      <div className="mt-4 flex gap-2 items-end">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600">ID Nota de Venta</label>
          <input
            className="border border-gray-300 rounded-md px-3 py-2 w-56"
            value={quoteId}
            onChange={(e) => setQuoteId(e.target.value)}
            placeholder="Ej: 3"
          />
        </div>
        <button
          onClick={fetchInvoice}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
        {data?.invoice?.xml && (
          <button
            onClick={downloadXml}
            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-black"
          >
            Descargar XML
          </button>
        )}
        {canPrint && (
          <button
            onClick={print}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Imprimir
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-600">{error}</div>
      )}

      {data?.invoice && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between gap-4">
            <div>
              <div className="text-sm text-gray-500">Factura</div>
              <div className="text-lg font-semibold">{data.invoice.invoiceNumber}</div>
              <div className="text-sm text-gray-700 mt-1">Cliente: {data.clienteNombre}</div>
              <div className="text-sm text-gray-700">Nota: {data.numeroCotizacion || `Q-${data.id}`}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-lg font-semibold">${data.invoice.totalAmount.toLocaleString('es-CL')}</div>
              <div className="text-xs text-gray-500">IVA (19%): ${data.invoice.taxAmount.toLocaleString('es-CL')}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
