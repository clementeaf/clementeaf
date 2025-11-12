import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { Input, SearchIcon } from '../../components/commons';

/**
 * Interfaz para un producto
 */
export interface Product {
  id: string;
  name: string;
  code?: string;
  price?: number;
  stock?: number;
}

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
   * Lista de productos disponibles (mock por ahora)
   */
  products?: Product[];
  /**
   * Si está cargando
   */
  isLoading?: boolean;
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
  products = [],
  isLoading = false,
  label = 'Producto',
  required = false,
  error
}: ProductSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  /**
   * Filtra productos según el término de búsqueda
   */
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts([]);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = products.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(searchLower);
      const codeMatch = product.code?.toLowerCase().includes(searchLower) ?? false;
      return nameMatch || codeMatch;
    });

    setFilteredProducts(filtered);
  }, [searchTerm, products]);

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
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsDropdownOpen(true);
  };

  /**
   * Maneja la selección de un producto
   */
  const handleSelectProduct = (product: Product): void => {
    if (onSelectProduct) {
      onSelectProduct(product);
    }
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  /**
   * Maneja el focus del input
   */
  const handleFocus = (): void => {
    if (searchTerm.trim() && filteredProducts.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  /**
   * Limpia la selección
   */
  const handleClear = (): void => {
    setSearchTerm('');
    setIsDropdownOpen(false);
    if (onSelectProduct) {
      onSelectProduct({ id: '', name: '' });
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <Input
        id="product-search"
        label={label}
        type="text"
        value={selectedProduct?.name || searchTerm}
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
                    {product.price !== undefined && (
                      <span className="text-xs text-gray-500">
                        ${product.price.toLocaleString('es-CL')}
                      </span>
                    )}
                    {product.stock !== undefined && (
                      <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : searchTerm.trim() ? (
            <div className="p-4 text-center text-gray-500">
              No se encontraron productos con "{searchTerm}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

