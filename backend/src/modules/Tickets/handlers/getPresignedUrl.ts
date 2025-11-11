import type { APIGatewayProxyEvent } from 'aws-lambda';
import { S3Service } from '../services/S3Service';
import { validateToken, extractToken } from '../../Users/utils/auth';
import { AuthService } from '../../Users/services/AuthService';
import { validateBody, parseBody } from '../../Users/utils/validation';
import { successResponse, errorResponse } from '../../Users/utils/response';
import type { GetPresignedUrlDto } from '../dto/GetPresignedUrlDto';

/**
 * Handler para generar presigned URLs de S3 para subir imágenes de tickets
 */
export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const tokenError = validateToken(event);
    if (tokenError) {
      return tokenError;
    }

    const token = extractToken(event)!;
    const authService = new AuthService();
    const user = await authService.verifyToken(token);
    const userId = user.id;

    const bodyError = validateBody(event);
    if (bodyError) {
      return bodyError;
    }

    const body = parseBody<GetPresignedUrlDto>(event.body!);
    if (!body) {
      return errorResponse(400, 'Invalid JSON format');
    }

    const { fileName, contentType, ticketId } = body;

    if (!fileName || !contentType) {
      return errorResponse(400, 'fileName y contentType son requeridos');
    }

    if (!contentType.startsWith('image/')) {
      return errorResponse(400, 'El contentType debe ser una imagen (image/*)');
    }

    const s3Service = new S3Service();
    const key = ticketId
      ? s3Service.generateTicketImageKey(ticketId, userId, fileName)
      : `tickets/temp/${userId}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const presignedUrl = await s3Service.getPresignedUploadUrl(key, contentType, 3600);

    return successResponse(
      200,
      {
        presignedUrl,
        key,
        expiresIn: 3600
      },
      'Presigned URL generada exitosamente'
    );
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return errorResponse(500, `Error al generar presigned URL: ${errorMessage}`);
  }
};

