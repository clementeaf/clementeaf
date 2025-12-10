import { type APIGatewayProxyEvent } from 'aws-lambda';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse } from '../../Users/utils/response';
import { WhatsAppApiService } from '../services/WhatsAppApiService';

/**
 * Handler para desconectar WhatsApp
 * @param event - Evento de API Gateway
 * @returns Respuesta de desconexión
 */
const disconnectHandler = async (_event: APIGatewayProxyEvent) => {
  // TODO: Implementar validación de permisos cuando se configure NAT Gateway en VPC
  // const permissionError = await validatePermission(_event, 'manage:whatsapp:connection');
  // if (permissionError) return permissionError;

  try {
    const whatsappService = new WhatsAppApiService();
    const result = await whatsappService.disconnect();
    return successResponse(200, result, result.message);
  } catch (error) {
    console.error('Error al desconectar WhatsApp:', error);
    return successResponse(200, {
      success: false,
      message: 'Servicio de WhatsApp no configurado. Configure WHATSAPP_SERVICE_URL en las variables de entorno.'
    }, 'Servicio de WhatsApp no disponible');
  }
};

export const handler = handlerWrapper(disconnectHandler);

