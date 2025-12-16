import { AppDataSource } from '../../../config/database';
import { Invoice } from '../entities/Invoice.entity';
import { InvoiceItem } from '../entities/InvoiceItem.entity';
import { WarehouseAccountingBalance } from '../entities/WarehouseAccountingBalance.entity';
import { InventoryLedgerEntry } from '../entities/InventoryLedgerEntry.entity';
import { Product as CatalogProduct } from '../../Products/entities/Product.entity';
import type { Quote } from '../../Quotes/entities/Quote.entity';
import type { StockMovement } from '../../Products/entities/StockMovement.entity';

type QuoteProduct = {
  codigo?: string;
  nombre?: string;
  cantidad?: number;
  cantidadSolicitada?: number;
  precio?: number;
  warehouseId?: number;
  bodegaId?: number;
};

/**
 * Servicio para emisión y persistencia de facturas (WMS).
 */
export class InvoicesService {
  private get invoiceRepo() {
    return AppDataSource.getRepository(Invoice);
  }
  private get itemRepo() {
    return AppDataSource.getRepository(InvoiceItem);
  }
  private get balanceRepo() {
    return AppDataSource.getRepository(WarehouseAccountingBalance);
  }
  private get ledgerRepo() {
    return AppDataSource.getRepository(InventoryLedgerEntry);
  }
  private get catalogRepo() {
    return AppDataSource.getRepository(CatalogProduct);
  }

  async findByQuoteId(quoteId: number): Promise<Invoice | null> {
    return await this.invoiceRepo.findOne({ where: { quoteId } });
  }

  /**
   * Emite la factura de una quote confirmada (idempotente por quoteId).
   * @param quote - Nota de venta
   * @param salidas - Movimientos SALIDA creados al confirmar picking
   * @returns Factura emitida
   */
  async emitInvoiceForQuote(quote: Quote, salidas: StockMovement[]): Promise<Invoice> {
    const existing = await this.findByQuoteId(quote.id);
    if (existing) {
      return existing;
    }

    const parsedProducts = this.parseQuoteProducts(quote.productos);
    const warehouseId = this.resolveWarehouseId(parsedProducts, salidas);

    const issueDate = new Date();
    const invoiceNumber = this.buildInvoiceNumber(quote);

    const { items, totals } = await this.buildInvoiceItemsAndTotals(parsedProducts);
    const xml = this.buildBasicInvoiceXml({
      invoiceNumber,
      issueDate,
      clienteNombre: quote.clienteNombre,
      netAmount: totals.netAmount,
      taxAmount: totals.taxAmount,
      totalAmount: totals.totalAmount,
      items
    });

    const invoice = await this.invoiceRepo.save(
      this.invoiceRepo.create({
        quoteId: quote.id,
        warehouseId,
        invoiceNumber,
        issueDate,
        currency: 'CLP',
        netAmount: totals.netAmount,
        taxAmount: totals.taxAmount,
        totalAmount: totals.totalAmount,
        status: 'emitida',
        xml
      })
    );

    // Persistir items
    const invoiceItems = items.map((it) =>
      this.itemRepo.create({
        invoiceId: invoice.id,
        productCode: it.productCode,
        productName: it.productName,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        lineTotal: it.lineTotal,
        costUnit: it.costUnit,
        costTotal: it.costTotal
      })
    );
    await this.itemRepo.save(invoiceItems);

    // Ledger + balance (haberes): restar inventario valorizado por costo
    const ledgerEntries = items.map((it) =>
      this.ledgerRepo.create({
        warehouseId,
        productCode: it.productCode,
        productName: it.productName,
        quantity: it.quantity,
        costUnit: it.costUnit,
        value: it.costTotal,
        quoteId: quote.id,
        invoiceId: invoice.id,
        stockMovementId: null,
        direction: 'OUT'
      })
    );
    await this.ledgerRepo.save(ledgerEntries);

    const totalCostOut = items.reduce((acc, it) => acc + it.costTotal, 0);
    await this.upsertWarehouseBalanceDelta(warehouseId, -totalCostOut);

    return invoice;
  }

  private parseQuoteProducts(productosJson: string | null): QuoteProduct[] {
    if (!productosJson) return [];
    try {
      const parsed = JSON.parse(productosJson);
      return Array.isArray(parsed) ? (parsed as QuoteProduct[]) : [];
    } catch {
      return [];
    }
  }

  private resolveWarehouseId(products: QuoteProduct[], salidas: StockMovement[]): number {
    const fromSalidas = salidas.find(s => typeof s.warehouseId === 'number')?.warehouseId;
    if (fromSalidas) return fromSalidas;
    const fromProducts = products.find(p => typeof p.warehouseId === 'number')?.warehouseId
      ?? products.find(p => typeof p.bodegaId === 'number')?.bodegaId;
    return typeof fromProducts === 'number' && fromProducts > 0 ? fromProducts : 1;
  }

  private buildInvoiceNumber(quote: Quote): string {
    // Idempotente y legible: usa numeroCotizacion si existe; si no, ID.
    const base = quote.numeroCotizacion && quote.numeroCotizacion.trim().length > 0
      ? quote.numeroCotizacion.trim()
      : `Q-${quote.id}`;
    return `FAC-${base}`;
  }

  private async buildInvoiceItemsAndTotals(products: QuoteProduct[]): Promise<{
    items: Array<{
      productCode: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
      costUnit: number;
      costTotal: number;
    }>;
    totals: { netAmount: number; taxAmount: number; totalAmount: number };
  }> {
    const normalized = products
      .map(p => ({
        productCode: (p.codigo || '').trim(),
        productName: (p.nombre || '').trim(),
        quantity: Number(p.cantidad ?? p.cantidadSolicitada ?? 0),
        unitPrice: Number(p.precio ?? 0)
      }))
      .filter(p => p.productCode.length > 0 && p.quantity > 0);

    const codes = Array.from(new Set(normalized.map(p => p.productCode)));
    const catalog = codes.length
      ? await this.catalogRepo
          .createQueryBuilder('p')
          .select(['p.codigo', 'p.purchaseRate'])
          .where('p.codigo IN (:...codes)', { codes })
          .getMany()
      : [];
    const costByCode: Record<string, number> = {};
    for (const p of catalog) {
      const pr = p.purchaseRate ? Number(p.purchaseRate) : 0;
      costByCode[p.codigo] = isNaN(pr) ? 0 : pr;
    }

    const items = normalized.map(p => {
      const lineTotal = round2(p.quantity * p.unitPrice);
      const costUnit = round2(costByCode[p.productCode] ?? 0);
      const costTotal = round2(p.quantity * costUnit);
      return { ...p, lineTotal, costUnit, costTotal };
    });

    const netAmount = round2(items.reduce((acc, it) => acc + it.lineTotal, 0));
    // MVP: IVA 19% si no viene explícito. Ajustable luego por producto/cliente.
    const taxAmount = round2(netAmount * 0.19);
    const totalAmount = round2(netAmount + taxAmount);
    return { items, totals: { netAmount, taxAmount, totalAmount } };
  }

  private buildBasicInvoiceXml(params: {
    invoiceNumber: string;
    issueDate: Date;
    clienteNombre: string;
    netAmount: number;
    taxAmount: number;
    totalAmount: number;
    items: Array<{
      productCode: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }>;
  }): string {
    const date = params.issueDate.toISOString().split('T')[0];
    const escapeXml = (s: string) =>
      s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const itemsXml = params.items
      .map((it, idx) => {
        return `
      <Detalle>
        <NroLinDet>${idx + 1}</NroLinDet>
        <VlrCodigo>${escapeXml(it.productCode)}</VlrCodigo>
        <NmbItem>${escapeXml(it.productName)}</NmbItem>
        <QtyItem>${it.quantity}</QtyItem>
        <PrcItem>${it.unitPrice}</PrcItem>
        <MontoItem>${it.lineTotal}</MontoItem>
      </Detalle>`;
      })
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<Factura>
  <Folio>${escapeXml(params.invoiceNumber)}</Folio>
  <Fecha>${escapeXml(date)}</Fecha>
  <Receptor>
    <Nombre>${escapeXml(params.clienteNombre || 'Cliente')}</Nombre>
  </Receptor>
  ${itemsXml}
  <Totales>
    <MntNeto>${params.netAmount}</MntNeto>
    <IVA>${params.taxAmount}</IVA>
    <MntTotal>${params.totalAmount}</MntTotal>
  </Totales>
</Factura>`;
  }

  private async upsertWarehouseBalanceDelta(warehouseId: number, delta: number): Promise<void> {
    const existing = await this.balanceRepo.findOne({ where: { warehouseId } });
    if (!existing) {
      await this.balanceRepo.save(
        this.balanceRepo.create({
          warehouseId,
          inventoryValue: round2(Math.max(0, 0 + delta))
        })
      );
      return;
    }
    existing.inventoryValue = round2(Math.max(0, Number(existing.inventoryValue) + delta));
    await this.balanceRepo.save(existing);
  }
}

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;


