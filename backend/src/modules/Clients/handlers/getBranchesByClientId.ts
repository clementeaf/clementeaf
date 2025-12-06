import { type APIGatewayProxyEvent } from 'aws-lambda';
import { BranchService } from '../services/BranchService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { initializeDatabase } from '../../../config/database';

/**
 * Handler para obtener todas las sucursales de un cliente
 * @param event - Evento de API Gateway
 * @returns Respuesta con lista de sucursales
 */
const getBranchesByClientIdHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const clientId = event.pathParameters?.clientId;

    if (!clientId) {
      return errorResponse(400, 'ID del cliente es requerido');
    }

    const clientIdNum = parseInt(clientId, 10);
    if (isNaN(clientIdNum)) {
      return errorResponse(400, 'ID del cliente debe ser un número válido');
    }

    const queryParams = event.queryStringParameters || {};
    const includeInactive = queryParams.includeInactive === 'true';

    await initializeDatabase();
    const branchService = new BranchService();
    const branches = await branchService.getBranchesByClientId(clientIdNum, includeInactive);

    return successResponse(200, {
      data: branches.map(branch => ({
        id: branch.id,
        clientId: branch.clientId,
        nombre: branch.nombre,
        direccion: branch.direccion,
        region: branch.region,
        comuna: branch.comuna,
        codigoPostal: branch.codigoPostal,
        contactoNombre: branch.contactoNombre,
        contactoTelefono: branch.contactoTelefono,
        contactoEmail: branch.contactoEmail,
        isActive: branch.isActive,
        createdAt: branch.createdAt.toISOString(),
        updatedAt: branch.updatedAt.toISOString()
      }))
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener sucursales';
    console.error('Error en getBranchesByClientIdHandler:', error);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(getBranchesByClientIdHandler);

