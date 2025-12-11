import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AppDataSource } from '../../../config/database';
import { OCRDocument } from '../entities/PurchaseOrder';

/**
 * Handler para obtener resultados de OCR
 * Retorna el documento con todos los datos extraídos
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const documentId = event.pathParameters?.id;

    if (!documentId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: 'documentId es requerido'
        })
      };
    }

    // Inicializar conexión a base de datos
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const ocrRepository = AppDataSource.getRepository(OCRDocument);

    // Buscar documento
    const document = await ocrRepository.findOne({
      where: { id: documentId }
    });

    if (!document) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: 'Documento no encontrado'
        })
      };
    }

    // Preparar respuesta sin rawTextractResponse (muy grande)
    const response = {
      id: document.id,
      fileName: document.fileName,
      documentType: document.documentType,
      status: document.status,
      orderNumber: document.orderNumber,
      issueDate: document.issueDate,
      deliveryDate: document.deliveryDate,
      companyName: document.companyName,
      companyRut: document.companyRut,
      items: document.items,
      subtotal: document.subtotal,
      tax: document.tax,
      total: document.total,
      paymentTerms: document.paymentTerms,
      notes: document.notes,
      errorMessage: document.errorMessage,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      processedAt: document.processedAt
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Documento obtenido exitosamente',
        data: response
      })
    };
  } catch (error) {
    console.error('Error en getOCRResults:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Error al obtener resultados de OCR',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
