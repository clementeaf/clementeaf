import { useState } from 'react';
import { Button } from '../../components/commons';

interface OCRDocument {
  id: string;
  fileName: string;
  documentType: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  orderNumber?: string;
  companyName?: string;
  total?: number;
  createdAt: string;
  processedAt?: string;
  errorMessage?: string;
}

interface ExtractedData {
  orderNumber?: string;
  issueDate?: string;
  deliveryDate?: string;
  companyName?: string;
  companyRut?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    sku?: string;
  }>;
  subtotal?: number;
  tax?: number;
  total?: number;
  paymentTerms?: string;
  notes?: string;
}

/**
 * Página de gestión de OCR
 * @returns Componente OCR
 */
export const OCR = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<OCRDocument | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCurrentDocument(null);
      setExtractedData(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // 1. Obtener URL pre-firmada
      const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL}/ocr/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          documentType: 'PURCHASE_ORDER'
        })
      });

      const uploadData = await uploadResponse.json();
      const { uploadUrl, documentId } = uploadData.data;

      // 2. Subir archivo a S3
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': selectedFile.type,
        },
        body: selectedFile
      });

      // 3. Actualizar estado
      setCurrentDocument({
        id: documentId,
        fileName: selectedFile.name,
        documentType: 'PURCHASE_ORDER',
        status: 'PENDING',
        createdAt: new Date().toISOString()
      });

      console.log('Documento subido exitosamente:', documentId);
    } catch (error) {
      console.error('Error al subir documento:', error);
      alert('Error al subir documento');
    } finally {
      setUploading(false);
    }
  };

  const handleProcess = async () => {
    if (!currentDocument) return;

    setProcessing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ocr/process/${currentDocument.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (data.data) {
        setCurrentDocument({
          ...currentDocument,
          status: data.data.status,
          processedAt: new Date().toISOString()
        });
        setExtractedData(data.data.extractedData);
      }

      console.log('Documento procesado:', data);
    } catch (error) {
      console.error('Error al procesar documento:', error);
      alert('Error al procesar documento');
    } finally {
      setProcessing(false);
    }
  };

  const handleGetResults = async () => {
    if (!currentDocument) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ocr/results/${currentDocument.id}`);
      const data = await response.json();
      
      if (data.data) {
        setCurrentDocument(data.data);
        
        // Reconstruir extractedData desde los campos del documento
        setExtractedData({
          orderNumber: data.data.orderNumber,
          issueDate: data.data.issueDate,
          deliveryDate: data.data.deliveryDate,
          companyName: data.data.companyName,
          companyRut: data.data.companyRut,
          items: data.data.items || [],
          subtotal: data.data.subtotal,
          tax: data.data.tax,
          total: data.data.total,
          paymentTerms: data.data.paymentTerms,
          notes: data.data.notes
        });
      }
    } catch (error) {
      console.error('Error al obtener resultados:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'PENDING':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  return (
    <div className="w-full h-full p-6 overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">OCR - Órdenes de Compra</h1>
        <p className="text-gray-600">Sube y procesa documentos de órdenes de compra con AWS Textract</p>
      </div>

      <div className="mt-6 space-y-6">
        {/* Upload Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Subir Documento</h2>
          
          <div className="space-y-4">
            <div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Archivo seleccionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              {uploading ? 'Subiendo...' : 'Subir Documento'}
            </Button>
          </div>
        </div>

        {/* Document Status */}
        {currentDocument && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Estado del Documento</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">ID:</span>
                <span className="text-sm text-gray-600 font-mono">{currentDocument.id}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Archivo:</span>
                <span className="text-sm text-gray-600">{currentDocument.fileName}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Estado:</span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(currentDocument.status)}`}>
                  {currentDocument.status}
                </span>
              </div>

              {currentDocument.errorMessage && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{currentDocument.errorMessage}</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                onClick={handleProcess}
                disabled={processing || currentDocument.status !== 'PENDING'}
                className="flex-1"
              >
                {processing ? 'Procesando...' : 'Procesar con Textract'}
              </Button>
              
              <Button
                onClick={handleGetResults}
                disabled={currentDocument.status !== 'COMPLETED'}
                className="flex-1 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Actualizar Resultados
              </Button>
            </div>
          </div>
        )}

        {/* Extracted Data */}
        {extractedData && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Datos Extraídos</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <span className="text-sm font-medium text-gray-700">N° Orden:</span>
                <p className="text-sm text-gray-600">{extractedData.orderNumber || '-'}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Empresa:</span>
                <p className="text-sm text-gray-600">{extractedData.companyName || '-'}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">RUT:</span>
                <p className="text-sm text-gray-600">{extractedData.companyRut || '-'}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Fecha Emisión:</span>
                <p className="text-sm text-gray-600">{extractedData.issueDate || '-'}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Fecha Entrega:</span>
                <p className="text-sm text-gray-600">{extractedData.deliveryDate || '-'}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Términos de Pago:</span>
                <p className="text-sm text-gray-600">{extractedData.paymentTerms || '-'}</p>
              </div>
            </div>

            {/* Items Table */}
            {extractedData.items.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-semibold text-gray-800 mb-3">Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {extractedData.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-600">{item.sku || '-'}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                          <td className="px-4 py-2 text-sm text-gray-600 text-right">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-600 text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-end space-y-2">
                <div className="w-64">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(extractedData.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-700">IVA:</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(extractedData.tax)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold mt-2 pt-2 border-t border-gray-300">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">{formatCurrency(extractedData.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {extractedData.notes && (
              <div className="mt-4">
                <span className="text-sm font-medium text-gray-700">Notas:</span>
                <p className="text-sm text-gray-600 mt-1">{extractedData.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OCR;
