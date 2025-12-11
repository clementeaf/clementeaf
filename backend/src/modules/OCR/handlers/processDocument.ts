import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AppDataSource } from '../../../config/database';
import { OCRDocument } from '../entities/OCRDocument.entity';
import { DocumentStatus } from '../types';
import { TextractService } from '../services/TextractService';
import { DocumentParser } from '../services/DocumentParser';

/**
 * Handler para procesar documento con Textract
 * Puede ser invocado manualmente o por un trigger de S3
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

    // Actualizar estado a PROCESSING
    document.status = DocumentStatus.PROCESSING;
    await ocrRepository.save(document);

    try {
      // Procesar con Textract
      const textractService = new TextractService();
      const textractResponse = await textractService.analyzeDocument(
        document.s3Bucket,
        document.s3Key
      );

      // Extraer datos estructurados
      const blocks = textractResponse.Blocks;
      const keyValuePairs = textractService.extractKeyValuePairs(blocks);
      const tables = textractService.extractTables(blocks);

      // Parsear a orden de compra
      const documentParser = new DocumentParser();
      const extractedData = documentParser.parsePurchaseOrder(
        blocks,
        keyValuePairs,
        tables
      );

      // Actualizar documento con datos extraídos
      document.status = DocumentStatus.COMPLETED;
      document.orderNumber = extractedData.orderNumber || null;
      document.issueDate = extractedData.issueDate ? new Date(extractedData.issueDate) : null;
      document.deliveryDate = extractedData.deliveryDate ? new Date(extractedData.deliveryDate) : null;
      document.companyName = extractedData.companyName || null;
      document.companyRut = extractedData.companyRut || null;
      document.items = extractedData.items as any;
      document.subtotal = extractedData.subtotal || null;
      document.tax = extractedData.tax || null;
      document.total = extractedData.total || null;
      document.paymentTerms = extractedData.paymentTerms || null;
      document.notes = extractedData.notes || null;
      document.rawTextractResponse = textractResponse as any;
      document.processedAt = new Date();

      await ocrRepository.save(document);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: 'Documento procesado exitosamente',
          data: {
            documentId: document.id,
            status: document.status,
            extractedData
          }
        })
      };
    } catch (processingError) {
      // Si falla el procesamiento, marcar como FAILED
      document.status = DocumentStatus.FAILED;
      document.errorMessage = processingError instanceof Error 
        ? processingError.message 
        : 'Error desconocido';
      await ocrRepository.save(document);

      throw processingError;
    }
  } catch (error) {
    console.error('Error en processDocument:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Error al procesar documento',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
