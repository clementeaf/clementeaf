/**
 * Tipos e interfaces para el módulo OCR
 */

/**
 * Estado de procesamiento del documento
 */
export enum DocumentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

/**
 * Tipo de documento
 */
export enum DocumentType {
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  INVOICE = 'INVOICE',
  RECEIPT = 'RECEIPT',
  OTHER = 'OTHER'
}

/**
 * Respuesta de Textract - Block básico
 */
export interface TextractBlock {
  BlockType: 'LINE' | 'WORD' | 'TABLE' | 'CELL' | 'KEY_VALUE_SET' | 'PAGE';
  Confidence: number;
  Text?: string;
  Geometry?: {
    BoundingBox: {
      Width: number;
      Height: number;
      Left: number;
      Top: number;
    };
  };
  Id: string;
  Relationships?: Array<{
    Type: string;
    Ids: string[];
  }>;
}

/**
 * Respuesta completa de Textract
 */
export interface TextractResponse {
  DocumentMetadata: {
    Pages: number;
  };
  Blocks: TextractBlock[];
  JobStatus?: 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED';
}

/**
 * Item de una orden de compra
 */
export interface PurchaseOrderItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sku?: string;
}

/**
 * Datos extraídos de una orden de compra
 */
export interface ExtractedPurchaseOrder {
  orderNumber?: string;
  issueDate?: string;
  deliveryDate?: string;
  companyName?: string;
  companyRut?: string;
  items: PurchaseOrderItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  paymentTerms?: string;
  notes?: string;
}

/**
 * Documento OCR almacenado
 */
export interface OCRDocument {
  id: string;
  fileName: string;
  s3Key: string;
  s3Bucket: string;
  documentType: DocumentType;
  status: DocumentStatus;
  textractJobId?: string;
  extractedData?: ExtractedPurchaseOrder;
  rawTextractResponse?: TextractResponse;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
}

/**
 * Request para upload de documento
 */
export interface UploadDocumentRequest {
  fileName: string;
  fileType: string;
  documentType: DocumentType;
}

/**
 * Response de upload de documento
 */
export interface UploadDocumentResponse {
  uploadUrl: string;
  documentId: string;
  s3Key: string;
}

/**
 * Response de procesamiento de documento
 */
export interface ProcessDocumentResponse {
  documentId: string;
  status: DocumentStatus;
  extractedData?: ExtractedPurchaseOrder;
}
