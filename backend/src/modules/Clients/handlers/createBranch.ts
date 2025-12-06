import { type APIGatewayProxyEvent } from 'aws-lambda';
import { BranchService } from '../services/BranchService';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { validateBody, parseBody } from '../../Users/utils/validation';
import { successResponse, errorResponse } from '../../Users/utils/response';
import { initializeDatabase } from '../../../config/database';
import type { CreateBranchDto } from '../dto/CreateBranchDto';

/**
 * Handler para crear una nueva sucursal
 * @param event - Evento de API Gateway
 * @returns Respuesta con sucursal creada
 */
const createBranchHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const bodyError = validateBody(event);
    if (bodyError) return bodyError;

    const dto = parseBody<CreateBranchDto>(event.body!);
    if (!dto) {
      return errorResponse(400, 'Invalid JSON format');
    }

    if (!dto.clientId || isNaN(dto.clientId)) {
      return errorResponse(400, 'clientId es requerido y debe ser un número válido');
    }

    if (!dto.nombre || dto.nombre.trim().length === 0) {
      return errorResponse(400, 'nombre es requerido');
    }

    await initializeDatabase();
    const branchService = new BranchService();
    const branch = await branchService.createBranch(dto);

    return successResponse(201, {
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
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear sucursal';
    console.error('Error en createBranchHandler:', error);
    return errorResponse(500, errorMessage);
  }
};

export const handler = handlerWrapper(createBranchHandler);

