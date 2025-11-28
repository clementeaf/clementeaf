import { type Quote } from '../../../../services/quotesService';

/**
 * Props del componente QuoteProductsSection
 */
interface QuoteProductsSectionProps {
  /**
   * Datos de la orden de compra
   */
  quote: Quote;
}

/**
 * Interfaz para un producto
 */
interface Product {
  id: string;
  nombre: string;
  cantidad: number;
  descuento: number;
  precio: number;
  totalLinea: number;
}

/**
 * Componente Sección de productos
 * @param props - Props del componente QuoteProductsSection
 * @returns Componente QuoteProductsSection
 */
export const QuoteProductsSection = ({ quote }: QuoteProductsSectionProps) => {
  let products: Product[] = [];
  
  if (quote.productos) {
    try {
      const parsed = JSON.parse(quote.productos);
      // Asegurar que sea un array
      if (Array.isArray(parsed)) {
        products = parsed as Product[];
      } else {
        products = [];
      }
    } catch {
      // Si no se puede parsear, mantener array vacío
      products = [];
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-base font-bold text-gray-800 mb-4">Productos</h3>
      {products.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 py-2 px-4">Nombre</th>
                <th className="text-left text-xs font-medium text-gray-500 py-2 px-4">Cantidad</th>
                <th className="text-left text-xs font-medium text-gray-500 py-2 px-4">Descuento</th>
                <th className="text-left text-xs font-medium text-gray-500 py-2 px-4">Precio</th>
                <th className="text-left text-xs font-medium text-gray-500 py-2 px-4">Total línea</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id || index} className="border-b border-gray-100">
                  <td className="py-2 px-4 text-sm text-gray-800">{product.nombre || '-'}</td>
                  <td className="py-2 px-4 text-sm text-gray-800">{product.cantidad || 0}</td>
                  <td className="py-2 px-4 text-sm text-gray-800">{product.descuento || 0}%</td>
                  <td className="py-2 px-4 text-sm text-gray-800">${product.precio || 0}</td>
                  <td className="py-2 px-4 text-sm font-medium text-gray-800">${product.totalLinea || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No hay productos en esta orden de compra.</p>
      )}
    </div>
  );
};

