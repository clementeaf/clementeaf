import { type EventBridgeEvent } from 'aws-lambda';
import { QuoteApprovedEvent } from '../../events/QuoteApprovedEvent';
import { initializeDatabase } from '../../../../config/database';
import { StockMovementService } from '../../../Products/services/StockMovementService';
import { MovementType } from '../../../Products/entities/StockMovement.entity';
import { WebSocketConnectionService } from '../../../Chat/services/WebSocketConnectionService';
import { AwsWebSocketClient } from '../../../Chat/services/aws/AwsWebSocketClient';
import { AppDataSource } from '../../../../config/database';
import { StockMovement } from '../../../Products/entities/StockMovement.entity';

interface QuoteApprovedProduct {
  id?: string | number;
  codigo?: string;
  nombre?: string;
  cantidad?: number;
  cantidadSolicitada?: number;
  warehouseId?: number;
  bodegaId?: number;
}

/**
 * Handler para procesar el evento de nota de venta aprobada
 * Crea reservas de stock para cada producto en la nota de venta
 * 
 * @param event - Evento de EventBridge
 */
export const quoteApprovedHandler = async (
  event: EventBridgeEvent<'quote.approved', QuoteApprovedEvent>
): Promise<void> => {
  try {
    const quoteData = event.detail;

    console.log(`📋 Procesando evento quote.approved para quote ID: ${quoteData.quoteId}`);
    console.log(`📊 Datos del evento:`, {
      quoteId: quoteData.quoteId,
      numeroCotizacion: quoteData.numeroCotizacion,
      clienteNombre: quoteData.clienteNombre,
      approvedBy: quoteData.approvedBy
    });

    // Inicializar base de datos
    await initializeDatabase();

    // Idempotencia: si ya existen reservas para esta quote, no volver a crearlas
    const movementRepo = AppDataSource.getRepository(StockMovement);
    const existingReservasCount = await movementRepo.count({
      where: {
        quoteId: quoteData.quoteId,
        type: MovementType.RESERVA
      }
    });
    if (existingReservasCount > 0) {
      console.log(`ℹ️ Quote ${quoteData.quoteId} ya tiene ${existingReservasCount} reservas. Omitiendo recreación.`);
      return;
    }

    // Parsear productos
    if (!quoteData.productos) {
      console.warn(`⚠️ Quote ${quoteData.quoteId} no tiene productos`);
      return;
    }

    let productos: QuoteApprovedProduct[];
    try {
      const parsed: unknown = JSON.parse(quoteData.productos);
      if (Array.isArray(parsed)) {
        productos = parsed as QuoteApprovedProduct[];
      } else if (typeof parsed === 'string') {
        const parsed2: unknown = JSON.parse(parsed);
        if (!Array.isArray(parsed2)) {
          console.error(`❌ productos no es un array para quote ${quoteData.quoteId}`);
          return;
        }
        productos = parsed2 as QuoteApprovedProduct[];
      } else {
        console.error(`❌ productos no es un array para quote ${quoteData.quoteId}`);
        return;
      }
    } catch (error) {
      console.error(`❌ Error parseando productos de quote ${quoteData.quoteId}:`, error);
      return;
    }

    console.log(`📦 Creando reservas para ${productos.length} productos`);

    // Crear movimientos de RESERVA para cada producto
    const stockMovementService = new StockMovementService();
    const reservasCreadas: Array<{ productId: string; productCode: string; cantidad: number; stockNuevo: number }> = [];

    for (const producto of productos) {
      try {
        const cantidad = producto.cantidad || producto.cantidadSolicitada || 0;
        
        if (cantidad <= 0) {
          console.warn(`⚠️ Producto ${producto.codigo || producto.id} tiene cantidad <= 0, omitiendo`);
          continue;
        }

        // Buscar bodega del producto o usar bodega por defecto
        const warehouseId = producto.warehouseId || producto.bodegaId || 1; // Default warehouse 1

        console.log(`📝 Creando RESERVA: ${producto.codigo} x${cantidad} en bodega ${warehouseId}`);

        const reserva = await stockMovementService.createMovement({
          productId: producto.id?.toString() || producto.codigo || 'unknown',
          productCode: producto.codigo || 'SIN-CODIGO',
          productName: producto.nombre || 'Producto sin nombre',
          warehouseId,
          type: MovementType.RESERVA,
          cantidad,
          documento: 'NOTA_VENTA',
          numeroDocumento: quoteData.numeroCotizacion || `Q-${quoteData.quoteId}`,
          observaciones: `Reserva automática por aprobación de nota de venta ${quoteData.numeroCotizacion}`,
          createdBy: quoteData.approvedBy || undefined,
          quoteId: quoteData.quoteId
        });

        reservasCreadas.push({
          productId: reserva.productId,
          productCode: reserva.productCode,
          cantidad: reserva.cantidad,
          stockNuevo: reserva.stockNuevo
        });

        console.log(`✅ RESERVA creada: ${reserva.productCode} - Stock nuevo: ${reserva.stockNuevo}`);
      } catch (error) {
        console.error(`❌ Error creando reserva para producto ${producto.codigo}:`, error);
        // Continuar con los demás productos
      }
    }

    console.log(`✅ ${reservasCreadas.length} reservas creadas exitosamente`);

    // Notificar vía WebSocket
    try {
      const endpoint = process.env.WEBSOCKET_API_ENDPOINT ||
        (process.env.WSS_ENDPOINT ? process.env.WSS_ENDPOINT.replace('wss://', 'https://') :
          'https://4hple5xva0.execute-api.us-east-1.amazonaws.com/dev');
      
      const webSocketClient = new AwsWebSocketClient(endpoint, process.env.AWS_REGION || 'us-east-1');
      const connectionService = new WebSocketConnectionService(webSocketClient);

      const message = {
        action: 'quote_stock_reserved',
        quoteId: quoteData.quoteId,
        numeroCotizacion: quoteData.numeroCotizacion,
        clienteNombre: quoteData.clienteNombre,
        reservasCreadas,
        totalReservas: reservasCreadas.length
      };

      await connectionService.broadcast(message);
      console.log(`📡 Notificación WebSocket enviada para quote ${quoteData.quoteId}`);
    } catch (wsError) {
      console.error('⚠️ Error enviando notificación WebSocket (no crítico):', wsError);
    }

    console.log(`🎉 Procesamiento de quote.approved completado para quote ${quoteData.quoteId}`);
  } catch (error) {
    console.error('❌ Error procesando evento quote.approved:', error);
    throw error; // EventBridge reintentará
  }
};

export const handler = quoteApprovedHandler;
