import { type APIGatewayProxyEvent } from 'aws-lambda';
import { BranchService } from '../services/BranchService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { initializeDatabase } from '../../../config/database';
import { EventPublisher } from '../../Quotes/services/EventPublisher';
import { BranchDeletedEventFactory } from '../events/BranchDeletedEvent';
import { extractToken } from '../../Users/utils/auth';
import { AuthService } from '../../Users/services/AuthService';

/**
 * Handler para eliminar una sucursal (soft delete)
 * @param event - Evento de API Gateway
 * @returns Respuesta de éxito
 */
const deleteBranchHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const clientIdParam = event.pathParameters?.clientId;
    const branchIdParam = event.pathParameters?.id;

    if (!clientIdParam || !branchIdParam) {
      return errorResponse(400, 'ID del cliente y de la sucursal son requeridos');
    }

    const clientId = parseInt(clientIdParam, 10);
    const branchId = parseInt(branchIdParam, 10);
    
    if (isNaN(clientId) || isNaN(branchId)) {
      return errorResponse(400, 'IDs deben ser números válidos');
    }

    await initializeDatabase();
    const branchService = new BranchService();
    
    // Obtener la sucursal antes de eliminarla para el evento
    const branch = await branchService.getBranchById(clientId, branchId);
    
    // Obtener userId del token si está disponible
    let deletedBy: number | undefined;
    try {
      const token = extractToken(event);
      if (token) {
        const authService = new AuthService();
        const verifiedUser = await authService.verifyToken(token);
        const usersService = new (await import('../../Users/services/UsersService')).UsersService();
        const user = await usersService.getUserByEmail(verifiedUser.email, false);
        if (user) {
          deletedBy = user.id;
        }
      }
    } catch (error) {
      console.warn('No se pudo obtener userId del token:', error);
    }

    // Eliminar la sucursal
    await branchService.deleteBranch(clientId, branchId);

    // Publicar evento de eliminación (no bloqueante)
    const eventPublisher = new EventPublisher();
    const deletedEvent = BranchDeletedEventFactory.create(
      {
        id: branch.id,
        clientId: branch.clientId,
        nombre: branch.nombre
      },
      deletedBy
    );

    eventPublisher.publish('branch.deleted', deletedEvent)
      .then(success => {
        if (success) {
          console.log(`✅ Evento branch.deleted publicado para branch ID: ${branch.id}`);
        } else {
          console.error(`❌ Error publicando evento branch.deleted para branch ID: ${branch.id}`);
        }
      })
      .catch(error => {
        console.error(`❌ Error publicando evento branch.deleted:`, error);
      });

    return successResponse(200, { message: 'Sucursal eliminada exitosamente' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al eliminar sucursal';
    console.error('Error en deleteBranchHandler:', error);
    
    if (errorMessage.includes('no encontrada')) {
      return errorResponse(404, errorMessage);
    }
    
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(deleteBranchHandler);

