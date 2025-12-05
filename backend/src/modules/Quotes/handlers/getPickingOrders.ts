import { type APIGatewayProxyEvent } from 'aws-lambda';
import { QuotesService } from '../services/QuotesService';
import { QuoteToPickingOrderService, type PickingOrderWithQuoteInfo } from '../services/QuoteToPickingOrderService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';

/**
 * Handler para obtener órdenes de picking desde notas de venta
 * @param event - Evento de API Gateway
 * @returns Respuesta con órdenes de picking
 */
const getPickingOrdersHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const queryParams = event.queryStringParameters || {};
    const page = parseInt(queryParams.page || '1', 10);
    const limit = parseInt(queryParams.limit || '50', 10);
    const estado = queryParams.estado; // Filtro opcional por estado

    const quotesService = new QuotesService();
    
    // Obtener todas las quotes (en producción, filtrar por estado si es necesario)
    const quotesData = await quotesService.getAllQuotes(page, limit);

    // Convertir Quotes a PickingOrders con información adicional (cliente, monto)
    const pickingOrders = QuoteToPickingOrderService.convertManyWithQuoteInfo(quotesData.data);

    // Filtrar por estado si se proporciona
    let filteredOrders = pickingOrders;
    if (estado) {
      filteredOrders = pickingOrders.filter(order => order.estado === estado);
    }

    return successResponse(
      200,
      {
        data: filteredOrders,
        total: filteredOrders.length,
        page,
        limit,
        totalPages: Math.ceil(filteredOrders.length / limit)
      },
      'Órdenes de picking obtenidas exitosamente'
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error al obtener órdenes de picking';
    console.error('Error en getPickingOrders:', errorMessage);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(getPickingOrdersHandler);

