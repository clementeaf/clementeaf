import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsService } from '../../services/productsService';
import { SearchIcon, DropdownIcon } from './icons';
import type { Product } from '../../services/productsService';

/**
 * Props del componente ProductSearchInput
 */
interface ProductSearchInputProps {
  /**
   * Valor actual del input
   */
  value: string;
  /**
   * Función que se ejecuta cuando cambia el valor
   */
  onChange: (value: string) => void;
  /**
   * Función que se ejecuta cuando se selecciona un producto
   */
  onProductSelect?: (product: Product) => void;
  /**
   * Placeholder del input
   */
  placeholder?: string;
  /**
   * Label del input
   */
  label?: string;
  /**
   * Clases CSS adicionales para el input
   */
  inputClassName?: string;
  /**
   * Mensaje de error
   */
  error?: string;
  /**
   * ID del input
   */
  id?: string;
  /**
   * Límite de resultados (default: 10)
   */
  limit?: number;
}

/**
 * Componente de búsqueda de productos con autocompletado
 * @param props - Props del componente ProductSearchInput
 * @returns Componente ProductSearchInput
 */
export const ProductSearchInput = ({
  value,
  onChange,
  onProductSelect,
  placeholder = 'Busca un producto por código, nombre o SKU',
  label,
  inputClassName = '',
  error,
  id,
  limit = 10
}: ProductSearchInputProps) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number; openUpward: boolean } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInternalUpdateRef = useRef(false);

  /**
   * Debounce del término de búsqueda (2 segundos)
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  /**
   * Busca productos cuando hay un término de búsqueda (usando el término con debounce)
   */
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'search', debouncedSearchTerm, limit],
    queryFn: async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.trim().length < 2) {
        return [];
      }
      return await productsService.searchProducts(debouncedSearchTerm, limit);
    },
    enabled: debouncedSearchTerm.trim().length >= 2,
    staleTime: 1000 * 60 * 5
  });

  const filteredProducts = useMemo(() => products || [], [products]);
  const productsCount = products?.length ?? 0;

  /**
   * Sincroniza el valor del input con el estado local
   * Solo actualiza si el valor cambió desde fuera del componente (no desde onChange interno)
   */
  useEffect(() => {
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }
    if (value !== searchTerm) {
      setSearchTerm(value);
      setDebouncedSearchTerm(value);
    }
  }, [value]);

  /**
   * Calcula la posición del dropdown cuando se abre
   */
  useEffect(() => {
    if (!isOpen) {
      setDropdownPosition(null);
      return;
    }

    if (!inputRef.current) {
      return;
    }

    // Usar un flag para evitar múltiples cálculos simultáneos
    let isCalculating = false;

    const calculatePosition = (): void => {
      if (!inputRef.current || isCalculating) return;
      isCalculating = true;

      const rect = inputRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const count = productsCount || 1; // Mínimo 1 para estimar altura
      const dropdownHeightEstimate = Math.min(count * 80 + 16, 240); // Estimar altura: ~80px por producto + padding
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      let topPosition = rect.bottom + 4; // Default: open downwards
      let openUpwards = false;

      if (spaceBelow < dropdownHeightEstimate && spaceAbove > dropdownHeightEstimate) {
        // Not enough space below, but enough space above
        topPosition = rect.top - dropdownHeightEstimate - 4;
        openUpwards = true;
      }

      setDropdownPosition(prev => {
        // Solo actualizar si la posición cambió significativamente
        if (prev && 
            Math.abs(prev.top - topPosition) < 1 && 
            Math.abs(prev.left - rect.left) < 1 && 
            Math.abs(prev.width - rect.width) < 1 &&
            prev.openUpwards === openUpwards) {
          isCalculating = false;
          return prev;
        }
        isCalculating = false;
        return {
          top: topPosition,
          left: rect.left,
          width: rect.width,
          openUpwards
        };
      });
    };

    // Usar requestAnimationFrame para evitar actualizaciones durante el render
    const rafId = requestAnimationFrame(() => {
      calculatePosition();
    });

    // Recalcular en scroll y resize con debounce
    let scrollTimeout: NodeJS.Timeout;
    let resizeTimeout: NodeJS.Timeout;

    const handleScroll = (): void => {
      if (isOpen && inputRef.current) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          calculatePosition();
        }, 50);
      }
    };

    const handleResize = (): void => {
      if (isOpen && inputRef.current) {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          calculatePosition();
        }, 50);
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(scrollTimeout);
      clearTimeout(resizeTimeout);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, productsCount]);

  /**
   * Cierra el dropdown cuando se hace click fuera
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as HTMLElement;
      // No cerrar si el click es en el dropdown
      if (target.closest('[data-dropdown]')) {
        return;
      }
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Maneja el cambio en el input
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value;
    isInternalUpdateRef.current = true;
    setSearchTerm(newValue);
    onChange(newValue);
    setIsOpen(true);
    setSelectedProductId(null);
  };

  /**
   * Maneja el click en el input
   */
  const handleInputClick = (): void => {
    if (filteredProducts.length > 0) {
      setIsOpen(true);
    }
  };

  /**
   * Maneja la selección de un producto
   */
  const handleProductSelect = (product: Product): void => {
    const displayValue = product.codigo || product.nombre || '';
    isInternalUpdateRef.current = true;
    setSearchTerm(displayValue);
    setDebouncedSearchTerm(displayValue);
    onChange(displayValue);
    setSelectedProductId(product.id);
    setIsOpen(false);

    if (onProductSelect) {
      onProductSelect(product);
    }
  };

  /**
   * Maneja el focus del input
   */
  const handleFocus = (): void => {
    if (filteredProducts.length > 0) {
      setIsOpen(true);
    }
  };

  /**
   * Formatea el precio para mostrar
   */
  const formatPrice = (precio?: number): string => {
    if (!precio) return '';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(precio);
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          <SearchIcon color="#9CA3AF" />
        </div>
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004BB7] focus:border-transparent ${
            error ? 'border-red-500' : 'border-gray-200'
          } ${inputClassName}`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <DropdownIcon color="#6B7280" />
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}

      {/* Dropdown de resultados */}
      {isOpen && (filteredProducts.length > 0 || (isLoading && debouncedSearchTerm.trim().length >= 2)) && dropdownPosition && (
        <div
          data-dropdown
          className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`
          }}
        >
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Buscando productos...
            </div>
          ) : filteredProducts.length > 0 ? (
            <ul className="py-1">
              {filteredProducts.map((product) => (
                <li
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors ${
                    selectedProductId === product.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {product.nombre}
                      </span>
                      {product.precio && (
                        <span className="text-sm font-semibold text-gray-700">
                          {formatPrice(product.precio)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {product.codigo && (
                        <span className="text-xs text-gray-500">Código: {product.codigo}</span>
                      )}
                      {product.sku && product.sku !== product.codigo && (
                        <span className="text-xs text-gray-500">SKU: {product.sku}</span>
                      )}
                      {product.stock !== undefined && (
                        <span className={`text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Stock: {product.stock}
                        </span>
                      )}
                    </div>
                    {product.categoria && (
                      <span className="text-xs text-gray-400 mt-0.5">{product.categoria}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : debouncedSearchTerm.trim().length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              No se encontraron productos
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

