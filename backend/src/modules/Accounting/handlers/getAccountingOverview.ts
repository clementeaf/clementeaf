import { type APIGatewayProxyEvent } from 'aws-lambda';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { validatePermission } from '../../Users/utils/permissions';
import { initializeDatabase, AppDataSource } from '../../../config/database';
import { Quote } from '../../Quotes/entities/Quote.entity';
import { Invoice } from '../entities/Invoice.entity';
import { WarehouseAccountingBalance } from '../entities/WarehouseAccountingBalance.entity';
import { isApprovedForPicking } from '../../Quotes/utils/pickingApproval';

/**
 * Vista contable: lista notas de venta con su estado (picking/factura) y haberes por bodega.
 */
const getAccountingOverviewHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const permissionError = await validatePermission(event, 'view:accounting:overview');
    if (permissionError) return permissionError;

    await initializeDatabase();

    const query = event.queryStringParameters || {};
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 50;
    const estado = query.estado || null;
    const estadoPicking = query.estadoPicking || null;

    if (isNaN(page) || page < 1) return errorResponse(400, 'page inválido');
    if (isNaN(limit) || limit < 1 || limit > 200) return errorResponse(400, 'limit inválido');

    const qb = AppDataSource.getRepository(Quote)
      .createQueryBuilder('q')
      .orderBy('q.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (estado) {
      qb.andWhere('q.estado = :estado', { estado });
    }
    if (estadoPicking) {
      qb.andWhere('q.estadoPicking = :estadoPicking', { estadoPicking });
    }

    const [quotes, total] = await qb.getManyAndCount();
    const quoteIds = quotes.map(q => q.id);

    const invoices = quoteIds.length
      ? await AppDataSource.getRepository(Invoice)
          .createQueryBuilder('i')
          .where('i.quoteId IN (:...ids)', { ids: quoteIds })
          .getMany()
      : [];
    const invoiceByQuoteId: Record<number, Invoice> = {};
    for (const inv of invoices) {
      invoiceByQuoteId[inv.quoteId] = inv;
    }

    const warehouseIds = Array.from(new Set(invoices.map(i => i.warehouseId)));
    const balances = warehouseIds.length
      ? await AppDataSource.getRepository(WarehouseAccountingBalance)
          .createQueryBuilder('b')
          .where('b.warehouseId IN (:...ids)', { ids: warehouseIds })
          .getMany()
      : [];
    const balanceByWarehouseId: Record<number, WarehouseAccountingBalance> = {};
    for (const b of balances) {
      balanceByWarehouseId[b.warehouseId] = b;
    }

    /**
     * Calcula el estado contable para UI basado en estadoPicking + existencia de factura.
     * @param quote - Nota de venta
     * @param invoice - Factura asociada (si existe)
     * @returns Estado contable para mostrar
     */
    const resolveAccountingStatus = (quote: Quote, invoice: Invoice | null): 'pendiente_factura' | 'facturada' | 'no_aplica' => {
      if (!isApprovedForPicking(quote.estado)) return 'no_aplica';
      if (invoice) return 'facturada';
      return quote.estadoPicking === 'confirmado' ? 'pendiente_factura' : 'no_aplica';
    };

    return successResponse(200, {
      data: quotes.map(q => {
        const inv = invoiceByQuoteId[q.id] || null;
        const balance = inv ? (balanceByWarehouseId[inv.warehouseId]?.inventoryValue ?? 0) : 0;
        const accountingStatus = resolveAccountingStatus(q, inv);
        return {
          quote: {
            id: q.id,
            numeroCotizacion: q.numeroCotizacion,
            clienteNombre: q.clienteNombre,
            estado: q.estado,
            estadoPicking: q.estadoPicking,
            createdAt: q.createdAt?.toISOString() ?? null
          },
          accountingStatus,
          invoice: inv
            ? {
                id: inv.id,
                invoiceNumber: inv.invoiceNumber,
                issueDate: inv.issueDate?.toISOString() ?? null,
                status: inv.status,
                netAmount: Number(inv.netAmount),
                taxAmount: Number(inv.taxAmount),
                totalAmount: Number(inv.totalAmount),
                warehouseId: inv.warehouseId
              }
            : null,
          warehouse: inv
            ? {
                warehouseId: inv.warehouseId,
                inventoryValue: Number(balance)
              }
            : null
        };
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error en getAccountingOverviewHandler:', error);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(getAccountingOverviewHandler);


