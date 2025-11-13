import { useState, useRef, useEffect, useCallback, type ChangeEvent } from 'react';
import { Input, SearchIcon } from '../../components/commons';
import { useSearchProducts } from '../../hooks/useProducts';
import type { Product as ApiProduct } from '../../services/productService';

/**
 * Interfaz para un producto (compatible con la API)
 */
export interface Product {
  id: string;
  name: string;
  code?: string;
  price?: number;
  stock?: number;
}

/**
 * Convierte un producto de la API al formato del componente
 */
const mapApiProductToComponent = (apiProduct: ApiProduct): Product => {
  return {
    id: apiProduct.nregist.toString(),
    name: apiProduct.nombre,
    code: apiProduct.codigo,
    price: apiProduct.precvta ?? undefined,
    stock: apiProduct.art_dispon ?? undefined
  };
};

/**
 * Props del componente ProductSearch
 */
interface ProductSearchProps {
  /**
   * Producto seleccionado
   */
  selectedProduct?: Product | null;
  /**
   * Función que se ejecuta cuando se selecciona un producto
   */
  onSelectProduct?: (product: Product) => void;
  /**
   * Label del campo
   */
  label?: string;
  /**
   * Si el campo es requerido
   */
  required?: boolean;
  /**
   * Mensaje de error
   */
  error?: string;
}

/**
 * Componente de búsqueda de productos
 * @param props - Props del componente ProductSearch
 * @returns Componente ProductSearch
 */
export const ProductSearch = ({
  selectedProduct,
  onSelectProduct,
  label = 'Producto',
  required = false,
  error
}: ProductSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce del término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Buscar productos cuando cambia el término de búsqueda con debounce
  const { data: products, isLoading } = useSearchProducts(
    debouncedSearchTerm,
    debouncedSearchTerm.trim().length >= 2,
    20
  );

  // Asegurar que products sea siempre un array
  const productsArray = Array.isArray(products) ? products : [];

  // Mapear productos de la API al formato del componente
  const filteredProducts: Product[] = productsArray.map(mapApiProductToComponent);

  /**
   * Cierra el dropdown cuando se hace click fuera
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  /**
   * Maneja el cambio en el input de búsqueda
   */
  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsDropdownOpen(true);
  }, []);

  /**
   * Maneja la selección de un producto
   */
  const handleSelectProduct = useCallback((product: Product): void => {
    if (onSelectProduct) {
      onSelectProduct(product);
    }
    setSearchTerm('');
    setIsDropdownOpen(false);
  }, [onSelectProduct]);

  /**
   * Maneja el focus del input
   */
  const handleFocus = useCallback((): void => {
    if (searchTerm.trim() && filteredProducts.length > 0) {
      setIsDropdownOpen(true);
    }
  }, [searchTerm, filteredProducts.length]);

  /**
   * Limpia la selección
   */
  const handleClear = useCallback((): void => {
    setSearchTerm('');
    setIsDropdownOpen(false);
    if (onSelectProduct) {
      onSelectProduct({ id: '', name: '' });
    }
  }, [onSelectProduct]);

  const displayValue = selectedProduct?.name || searchTerm;

  return (
    <div ref={searchRef} className="relative">
      <Input
        id="product-search"
        label={label}
        type="text"
        value={displayValue}
        onChange={handleSearchChange}
        onFocus={handleFocus}
        placeholder="Buscar producto por nombre o código..."
        error={error}
        required={required}
        leftIcon={<SearchIcon />}
        rightIcon={
          selectedProduct ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Limpiar selección"
            >
              ×
            </button>
          ) : undefined
        }
      />

      {isDropdownOpen && (searchTerm.trim() || filteredProducts.length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Buscando productos...</div>
          ) : filteredProducts.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleSelectProduct(product)}
                  className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{product.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {product.code && (
                      <span className="text-xs text-gray-500">Código: {product.code}</span>
                    )}
                    {product.price !== undefined && product.price !== null && (
                      <span className="text-xs text-gray-500">
                        ${product.price.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                    )}
                    {product.stock !== undefined && product.stock !== null && (
                      <span className="text-xs text-gray-500">
                        Stock: {product.stock.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : searchTerm.trim().length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              No se encontraron productos con "{searchTerm}"
            </div>
          ) : searchTerm.trim().length > 0 ? (
            <div className="p-4 text-center text-gray-500">
              Escribe al menos 2 caracteres para buscar
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
