import { useState, useEffect } from 'react';
import { DocumentIcon, EyeIcon } from '../../../components/commons';

/**
 * Props del componente QuoteReviewForm
 */
interface QuoteReviewFormProps {
  /**
   * Función para actualizar los datos del formulario
   */
  onDataChange?: (data: Record<string, string>) => void;
  /**
   * Datos iniciales del formulario
   */
  initialData?: Record<string, string>;
  /**
   * Función para volver al paso anterior
   */
  onBack?: () => void;
}

/**
 * Componente Formulario de revisión (Paso 4)
 * @param props - Props del componente QuoteReviewForm
 * @returns Componente QuoteReviewForm
 */
export const QuoteReviewForm = ({ onDataChange, initialData, onBack }: QuoteReviewFormProps) => {
  const [formData, setFormData] = useState<Record<string, string>>(
    initialData || {}
  );

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => {
        const hasChanges = Object.keys(initialData).some(
          key => prev[key] !== initialData[key]
        );
        return hasChanges ? { ...prev, ...initialData } : prev;
      });
    }
  }, [initialData]);

  // Función para obtener datos de ejemplo (en producción vendrían de los pasos anteriores)
  const getReviewData = () => {
    // Si tenemos region y comuna separados, combinarlos; si no, usar regionComunaCodigo (compatibilidad)
    const region = formData.region || '';
    const comuna = formData.comuna || '';
    const regionComunaCodigo = region && comuna 
      ? `${region} / ${comuna}` 
      : (formData.regionComunaCodigo || '');
    
    return {
      // Paso 1: Cliente
      clienteNombre: formData.clienteNombre || '',
      direccionDespacho: formData.direccionDespacho || formData.direccionFacturacion || '',
      telefono: formData.telefono || '',
      region: region,
      comuna: comuna,
      regionComunaCodigo: regionComunaCodigo,
      asesorAsignado: formData.asesorAsignado || '',
      retiroEnBodega: formData.retiroEnBodega === 'true',
      contactoNombre: formData.contactoNombre || 'María González',
      contactoTelefono: formData.contactoTelefono || '+56 983146890',
      contactoEmail: formData.contactoEmail || 'maria.gonzalez@empresa.com',
      
      // Paso 2: Condiciones
      numeroCotizacion: formData.numeroCotizacion || '',
      fecha: formData.fecha || '',
      terminosPago: formData.terminosPago || '',
      numeroReferencia: formData.numeroReferencia || '',
      centroCosto: formData.centroCosto || '',
      listaPrecios: formData.listaPrecios || '',
      sinCostoEnvio: formData.sinCostoEnvio === 'true',
      
      // Paso 3: Productos (se parsean desde JSON)
      productos: formData.productos || '[]'
    };
  };

  const reviewData = getReviewData();

  const handleDownloadFile = (): void => {
    // TODO: Implementar descarga de archivo
    console.log('Descargar archivo');
  };

  const handleViewFile = (): void => {
    // TODO: Implementar visualización de archivo
    console.log('Ver archivo');
  };

  // Parsear productos
  let productos: Array<{ nombre: string; cantidad: string; descuento: string; precio: string; totalLinea: string }> = [];
  try {
    productos = JSON.parse(reviewData.productos);
  } catch {
    productos = [];
  }

  return (
    <div className="flex-1 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6">Revisión y confirmación</h2>
      
      <div className="space-y-6">
        {/* Información del cliente */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">Información del cliente</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Nombre del cliente</p>
              <p className="text-sm font-medium text-gray-800">{reviewData.clienteNombre || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Asesor asignado</p>
              <p className="text-sm font-medium text-gray-800">{reviewData.asesorAsignado || '-'}</p>
            </div>
            {!reviewData.retiroEnBodega ? (
              <>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Región</p>
                  <p className="text-sm font-medium text-gray-800">{reviewData.region || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Comuna</p>
                  <p className="text-sm font-medium text-gray-800">{reviewData.comuna || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Dirección de despacho</p>
                  <p className="text-sm font-medium text-gray-800">{reviewData.direccionDespacho || '-'}</p>
                </div>
              </>
            ) : (
              <div className="col-span-2">
                <p className="text-sm text-gray-600 mb-1">Retiro en bodega</p>
                <p className="text-sm font-medium text-gray-800">Sí - El cliente retirará el producto en bodega</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600 mb-1">Teléfono</p>
              <p className="text-sm font-medium text-gray-800">{reviewData.telefono || '-'}</p>
            </div>
          </div>
        </div>

        {/* Condiciones */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">Condiciones de la orden de compra</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">N° de orden de compra</p>
              <p className="text-sm font-medium text-gray-800">{reviewData.numeroCotizacion || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Fecha</p>
              <p className="text-sm font-medium text-gray-800">{reviewData.fecha || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Términos de pago</p>
              <p className="text-sm font-medium text-gray-800">{reviewData.terminosPago || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">N° de referencia</p>
              <p className="text-sm font-medium text-gray-800">{reviewData.numeroReferencia || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Centro de costo</p>
              <p className="text-sm font-medium text-gray-800">{reviewData.centroCosto || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Lista de precios</p>
              <p className="text-sm font-medium text-gray-800">{reviewData.listaPrecios || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Sin costo de envío</p>
              <p className="text-sm font-medium text-gray-800">{reviewData.sinCostoEnvio ? 'Sí' : 'No'}</p>
            </div>
          </div>
        </div>

        {/* Productos */}
        {productos.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-800 mb-4">Productos</h3>
            <div className="space-y-3">
              {productos.map((producto, index) => (
                <div key={index} className="grid grid-cols-5 gap-4 py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nombre</p>
                    <p className="text-sm font-medium text-gray-800">{producto.nombre || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Cantidad</p>
                    <p className="text-sm font-medium text-gray-800">{producto.cantidad || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Descuento</p>
                    <p className="text-sm font-medium text-gray-800">{producto.descuento || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Precio</p>
                    <p className="text-sm font-medium text-gray-800">{producto.precio || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total línea</p>
                    <p className="text-sm font-medium text-gray-800">{producto.totalLinea || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contacto principal */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">Contacto principal</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Nombre</p>
              <p className="text-sm font-medium text-gray-800">{reviewData.contactoNombre || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Teléfono</p>
              <p className="text-sm font-medium text-gray-800">{reviewData.contactoTelefono || '-'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-600 mb-1">Correo electrónico</p>
              <p className="text-sm font-medium text-gray-800">{reviewData.contactoEmail || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

