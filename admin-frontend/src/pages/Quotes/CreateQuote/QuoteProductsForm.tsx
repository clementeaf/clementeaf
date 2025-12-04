import { useState, useEffect, useRef, useMemo } from 'react';
import { Input, Button, DropdownIcon, PlusIcon, ProductSearchInput } from '../../../components/commons';
import type { Product } from '../../../services/productsService';

/**
 * Interfaz para un producto en la orden de compra
 */
interface ProductItem {
  id: string;
  nombre: string;
  cantidad: string;
  descuento: string;
  precio: string;
  totalLinea: string;
}

/**
 * Props del componente QuoteProductsForm
 */
interface QuoteProductsFormProps {
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
 * Componente Formulario de productos (Paso 3)
 * @param props - Props del componente QuoteProductsForm
 * @returns Componente QuoteProductsForm
 */
export const QuoteProductsForm = ({ onDataChange, initialData, onBack }: QuoteProductsFormProps) => {
  const [products, setProducts] = useState<ProductItem[]>([
    {
      id: '1',
      nombre: '',
      cantidad: '1',
      descuento: '0 %',
      precio: '$0',
      totalLinea: '$0'
    }
  ]);

  // Usar useRef para mantener la referencia de onDataChange y evitar loops
  const onDataChangeRef = useRef(onDataChange);
  useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);

  // Memoizar los productos parseados de initialData para evitar comparaciones innecesarias
  const initialProducts = useMemo(() => {
    if (initialData?.productos) {
      try {
        const parsedProducts = JSON.parse(initialData.productos);
        if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
          return parsedProducts;
        }
      } catch {
        // Si no se puede parsear, retornar null
      }
    }
    return null;
  }, [initialData?.productos]);

  // Flag para evitar actualizaciones desde initialData cuando el cambio viene del usuario
  const isUserUpdateRef = useRef(false);

  // Actualizar productos solo si initialProducts cambió y es diferente al estado actual
  useEffect(() => {
    if (initialProducts && !isUserUpdateRef.current) {
      // Comparar si los productos son diferentes antes de actualizar
      setProducts(prevProducts => {
        const currentProductsStr = JSON.stringify(prevProducts);
        const newProductsStr = JSON.stringify(initialProducts);
        
        if (currentProductsStr !== newProductsStr) {
          return initialProducts;
        }
        return prevProducts;
      });
    }
    // Resetear el flag después de procesar
    isUserUpdateRef.current = false;
  }, [initialProducts]);

  /**
   * Actualiza los datos cuando cambian los productos
   * Usar useRef para evitar incluir onDataChange en las dependencias
   */
  useEffect(() => {
    if (onDataChangeRef.current) {
      onDataChangeRef.current({
        productos: JSON.stringify(products)
      });
    }
  }, [products]);

  /**
   * Maneja el cambio de un campo de un producto
   */
  const handleProductChange = (productId: string, field: keyof ProductItem, value: string): void => {
    isUserUpdateRef.current = true; // Marcar como actualización del usuario
    setProducts(prev => prev.map(product => {
      if (product.id === productId) {
        const updated = { ...product, [field]: value };
        
        // Calcular total línea si cambian cantidad, descuento o precio
        if (field === 'cantidad' || field === 'descuento' || field === 'precio') {
          const cantidad = parseFloat(updated.cantidad) || 0;
          const precio = parseFloat(updated.precio.replace('$', '').replace(',', '').replace(/\./g, '')) || 0;
          const descuento = parseFloat(updated.descuento.replace('%', '').trim()) || 0;
          const subtotal = cantidad * precio;
          const descuentoAmount = subtotal * (descuento / 100);
          const total = subtotal - descuentoAmount;
          updated.totalLinea = `$${total.toLocaleString('es-CL')}`;
        }
        
        return updated;
      }
      return product;
    }));
  };

  /**
   * Maneja la selección de un producto desde el buscador
   */
  const handleProductSelect = (productId: string, product: Product): void => {
    isUserUpdateRef.current = true; // Marcar como actualización del usuario
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const precio = product.precio || 0;
        const cantidad = parseFloat(p.cantidad) || 1;
        const descuento = parseFloat(p.descuento.replace('%', '').trim()) || 0;
        const subtotal = cantidad * precio;
        const descuentoAmount = subtotal * (descuento / 100);
        const total = subtotal - descuentoAmount;

        return {
          ...p,
          nombre: product.nombre,
          precio: `$${precio.toLocaleString('es-CL')}`,
          totalLinea: `$${total.toLocaleString('es-CL')}`
        };
      }
      return p;
    }));
  };

  /**
   * Agrega un nuevo producto
   */
  const handleAddProduct = (): void => {
    isUserUpdateRef.current = true; // Marcar como actualización del usuario
    const newProduct: ProductItem = {
      id: Date.now().toString(),
      nombre: '',
      cantidad: '1',
      descuento: '0 %',
      precio: '$0',
      totalLinea: '$0'
    };
    setProducts(prev => [...prev, newProduct]);
  };

  /**
   * Elimina un producto específico
   */
  const handleDeleteProduct = (productId: string): void => {
    isUserUpdateRef.current = true; // Marcar como actualización del usuario
    setProducts(prev => {
      const filtered = prev.filter(p => p.id !== productId);
      // Asegurar que siempre haya al menos un producto
      return filtered.length > 0 ? filtered : [{
        id: '1',
        nombre: '',
        cantidad: '1',
        descuento: '0 %',
        precio: '$0',
        totalLinea: '$0'
      }];
    });
  };

  /**
   * Elimina todos los productos
   */
  const handleDeleteAll = (): void => {
    isUserUpdateRef.current = true; // Marcar como actualización del usuario
    setProducts([{
      id: '1',
      nombre: '',
      cantidad: '1',
      descuento: '0 %',
      precio: '$0',
      totalLinea: '$0'
    }]);
  };

  /**
   * Maneja la importación desde Excel
   */
  const handleImportExcel = (): void => {
    // TODO: Implementar importación desde Excel
    console.log('Importar desde Excel');
  };

  return (
    <div className="flex-1 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6">Ítems o productos cotizados</h2>
      
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-800">Productos</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={handleDeleteAll}
              className="text-[#0052C9] hover:text-[#004BB7] text-sm font-medium"
            >
              Eliminar todos
            </button>
            <Button
              onClick={handleImportExcel}
              className="bg-[#0052C9] text-white hover:bg-[#004BB7] px-4 py-2 text-sm"
            >
              Importar Excel
            </Button>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Headers */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="col-span-1 text-sm font-medium text-gray-700"></div>
            <div className="col-span-3 text-sm font-medium text-gray-700">Nombre</div>
            <div className="col-span-2 text-sm font-medium text-gray-700">Cantidad</div>
            <div className="col-span-2 text-sm font-medium text-gray-700">Descuento</div>
            <div className="col-span-2 text-sm font-medium text-gray-700">Precio</div>
            <div className="col-span-2 text-sm font-medium text-gray-700">Total línea</div>
          </div>

          {/* Filas de productos */}
          <div className="divide-y divide-gray-200">
            {products.map((product, index) => (
              <div key={product.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center">
                <div className="col-span-1 text-sm text-gray-600">{index + 1}</div>
                <div className="col-span-3">
                  <ProductSearchInput
                    id={`product-${product.id}-nombre`}
                    value={product.nombre}
                    onChange={(value): void => handleProductChange(product.id, 'nombre', value)}
                    onProductSelect={(selectedProduct): void => handleProductSelect(product.id, selectedProduct)}
                    placeholder="Busca un producto por código, nombre o SKU"
                    inputClassName="bg-white"
                    limit={10}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    id={`product-${product.id}-cantidad`}
                    type="number"
                    value={product.cantidad}
                    onChange={(e): void => handleProductChange(product.id, 'cantidad', e.target.value)}
                    inputClassName="bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    id={`product-${product.id}-descuento`}
                    value={product.descuento}
                    onChange={(e): void => handleProductChange(product.id, 'descuento', e.target.value)}
                    inputClassName="bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    id={`product-${product.id}-precio`}
                    value={product.precio}
                    onChange={(e): void => handleProductChange(product.id, 'precio', e.target.value)}
                    inputClassName="bg-white"
                  />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Input
                    id={`product-${product.id}-total`}
                    value={product.totalLinea}
                    readOnly
                    inputClassName="bg-gray-50"
                  />
                  <button
                    onClick={(): void => handleDeleteProduct(product.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Eliminar producto"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botón Añadir producto */}
        <div className="flex justify-center mt-4">
          <Button
            onClick={handleAddProduct}
            className="bg-[#0052C9] text-white hover:bg-[#004BB7] px-4 py-2"
            leftIcon={<PlusIcon color="white" />}
          >
            Añadir producto
          </Button>
        </div>
      </div>
    </div>
  );
};

