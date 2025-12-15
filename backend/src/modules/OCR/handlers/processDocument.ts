import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AppDataSource } from '../../../config/database';
import { OCRDocument } from '../entities/OCRDocument.entity';
import { DocumentStatus } from '../types';
import { TextractService } from '../services/TextractService';
import { DocumentParser } from '../services/DocumentParser';
import { WebSocketConnectionService } from '../../Chat/services/WebSocketConnectionService';
import { AwsWebSocketClient } from '../../Chat/services/aws/AwsWebSocketClient';
import { IWebSocketClient } from '../../Chat/interfaces/IWebSocketClient';

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

    // Parsear body si existe (datos ya procesados desde frontend)
    let extractedText: string | undefined;
    let parsedData: any;
    
    if (event.body) {
      try {
        const body = JSON.parse(event.body);
        extractedText = body.extractedText;
        parsedData = body.parsedData;
      } catch (e) {
        console.log('No se pudo parsear el body, procesando con Textract');
      }
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

    // Notificar vía WebSocket que el procesamiento ha iniciado
    await notifyOCRStatus(document.id, 'PROCESSING', {
      fileName: document.fileName,
      documentType: document.documentType
    });

    try {
      let extractedData: any;

      // Si vienen datos del frontend (Tesseract.js), usarlos directamente
      if (parsedData) {
        console.log('🌐 Usando datos procesados desde el frontend (Tesseract.js)');
        extractedData = parsedData;
      } else {
        // Si no, intentar con Textract (requiere suscripción AWS)
        console.log('☁️ Procesando con AWS Textract...');
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
        extractedData = documentParser.parsePurchaseOrder(
          blocks,
          keyValuePairs,
          tables
        );
      }

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
      document.rawTextractResponse = extractedText ? { extractedText, source: 'tesseract' } as any : null;
      document.processedAt = new Date();

      await ocrRepository.save(document);

      // Notificar vía WebSocket que el procesamiento ha completado
      await notifyOCRStatus(document.id, 'COMPLETED', {
        fileName: document.fileName,
        documentType: document.documentType,
        extractedData: {
          orderNumber: extractedData.orderNumber,
          companyName: extractedData.companyName,
          companyRut: extractedData.companyRut,
          total: extractedData.total,
          itemsCount: extractedData.items.length
        }
      });

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

      // Notificar vía WebSocket que el procesamiento ha fallado
      await notifyOCRStatus(document.id, 'FAILED', {
        fileName: document.fileName,
        errorMessage: document.errorMessage
      });

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
    }
  }
};

/**
 * Notifica el estado del documento OCR vía WebSocket a todos los clientes conectados
 */
async function notifyOCRStatus(
  documentId: string,
  status: string,
  additionalData?: Record<string, any>
): Promise<void> {
  try {
    const isLocal = process.env.IS_OFFLINE === 'true' || 
                    process.env.NODE_ENV === 'development' || 
                    !process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    let webSocketClient: IWebSocketClient;
    if (isLocal) {
      const { LocalWebSocketClient } = await import('../../Chat/services/LocalWebSocketClient');
      webSocketClient = new LocalWebSocketClient();
      console.log('🔧 [LOCAL] Usando LocalWebSocketClient para OCR');
    } else {
      const endpoint = process.env.WEBSOCKET_API_ENDPOINT || 
                      (process.env.WSS_ENDPOINT ? process.env.WSS_ENDPOINT.replace('wss://', 'https://') : 
                       'https://4hple5xva0.execute-api.us-east-1.amazonaws.com/dev');
      
      webSocketClient = new AwsWebSocketClient(
        endpoint,
        process.env.AWS_REGION || 'us-east-1'
      );
    }
    
    const connectionService = new WebSocketConnectionService(webSocketClient);

    const message = {
      action: 'ocr_document_update',
      documentId,
      status,
      timestamp: new Date().toISOString(),
      ...additionalData
    };

    const sentCount = await connectionService.broadcast(message);
    console.log(`📡 OCR status (${status}) enviado vía WebSocket a ${sentCount} conexión(es) - Doc: ${documentId}`);
  } catch (error) {
    console.error('❌ Error enviando notificación WebSocket para OCR:', error);
    // No lanzar error para no interrumpir el flujo principal
  }
}
