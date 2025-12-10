import { type APIGatewayProxyEvent } from 'aws-lambda';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse } from '../../Users/utils/response';
import { WhatsAppApiService } from '../services/WhatsAppApiService';

/**
 * Handler para obtener el estado de la conexión de WhatsApp
 * @param event - Evento de API Gateway
 * @returns Estado de la conexión
 */
const getStatusHandler = async (_event: APIGatewayProxyEvent) => {
  // TODO: Implementar validación de permisos cuando se configure NAT Gateway en VPC
  // const permissionError = await validatePermission(_event, 'view:whatsapp:status');
  // if (permissionError) return permissionError;

  try {
    const whatsappService = new WhatsAppApiService();
    const status = await whatsappService.getStatus();
    return successResponse(200, status.data, 'Estado de WhatsApp obtenido');
  } catch (error) {
    // Si el servicio de WhatsApp no está disponible, retornar estado desconectado
    console.error('Error al obtener estado de WhatsApp:', error);
    
    // Retornar estado por defecto si el servicio no está disponible
    return successResponse(200, {
      status: 'disconnected',
      isAuthenticated: false,
      message: 'Servicio de WhatsApp no configurado. Configure WHATSAPP_SERVICE_URL en las variables de entorno.'
    }, 'Estado de WhatsApp (servicio no disponible)');
  }
};

export const handler = handlerWrapper(getStatusHandler);

