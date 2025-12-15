import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AppDataSource } from '../../../config/database';
import { OCRDocument } from '../entities/OCRDocument.entity';

/**
 * Handler para listar documentos OCR
 * Retorna los últimos documentos ordenados por fecha de creación
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parámetros de paginación
    const limit = event.queryStringParameters?.limit 
      ? parseInt(event.queryStringParameters.limit) 
      : 50;
    const offset = event.queryStringParameters?.offset 
      ? parseInt(event.queryStringParameters.offset) 
      : 0;

    // Inicializar conexión a base de datos
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const ocrRepository = AppDataSource.getRepository(OCRDocument);

    // Obtener documentos ordenados por fecha de creación (más recientes primero)
    const [documents, total] = await ocrRepository.findAndCount({
      order: {
        createdAt: 'DESC'
      },
      take: limit,
      skip: offset
    });

    // Preparar respuesta sin rawTextractResponse (muy grande)
    const documentsResponse = documents.map(doc => ({
      id: doc.id,
      fileName: doc.fileName,
      documentType: doc.documentType,
      status: doc.status,
      orderNumber: doc.orderNumber,
      companyName: doc.companyName,
      companyRut: doc.companyRut,
      total: doc.total,
      itemsCount: doc.items ? (Array.isArray(doc.items) ? doc.items.length : 0) : 0,
      errorMessage: doc.errorMessage,
      createdAt: doc.createdAt,
      processedAt: doc.processedAt
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Documentos obtenidos exitosamente',
        data: {
          documents: documentsResponse,
          total,
          limit,
          offset
        }
      })
    };
  } catch (error) {
    console.error('Error en listDocuments:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Error al listar documentos OCR',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
