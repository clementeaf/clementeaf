import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../../../config/database';
import { OCRDocument } from '../entities/OCRDocument.entity';
import { DocumentType, DocumentStatus } from '../types';

const s3Client = new S3Client({ region: process.env.OCR_REGION || 'us-east-1' });
const BUCKET_NAME = process.env.OCR_BUCKET_NAME || 'banados-ocr-documents';

/**
 * Handler para generar URL de upload pre-firmada
 * El cliente usa esta URL para subir el documento directamente a S3
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: 'El cuerpo de la petición es requerido'
        })
      };
    }

    const { fileName, fileType, documentType } = JSON.parse(event.body);

    if (!fileName || !fileType) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: 'fileName y fileType son requeridos'
        })
      };
    }

    // Generar ID único para el documento
    const documentId = uuidv4();
    const fileExtension = fileName.split('.').pop();
    const s3Key = `documents/${documentId}.${fileExtension}`;

    // Generar URL pre-firmada para upload
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: fileType
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // Inicializar conexión a base de datos
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const ocrRepository = AppDataSource.getRepository(OCRDocument);

    // Crear registro en base de datos
    const ocrDocument = ocrRepository.create({
      id: documentId,
      fileName,
      s3Key,
      s3Bucket: BUCKET_NAME,
      documentType: documentType || DocumentType.PURCHASE_ORDER,
      status: DocumentStatus.PENDING
    });

    await ocrRepository.save(ocrDocument);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'URL de upload generada exitosamente',
        data: {
          uploadUrl,
          documentId,
          s3Key
        }
      })
    };
  } catch (error) {
    console.error('Error en uploadDocument:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Error al generar URL de upload',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
