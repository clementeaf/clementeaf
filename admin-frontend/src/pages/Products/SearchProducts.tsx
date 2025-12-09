import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader, SearchBar, DataTablePage, Select, Toggle, Tabs, type TabItem, Button } from '../../components/commons';
import { productsService } from '../../services/productsService';
import { warehousesService } from '../../services/warehousesService';
import { stockMovementsService, MovementType } from '../../services/stockMovementsService';
import { useStockMovementsWebSocket } from '../../hooks/useStockMovementsWebSocket';
import type { Product } from '../../services/productsService';
import type { Warehouse } from '../../services/warehousesService';
import { columns } from './columns';
import { historyColumns } from './HistoryColumns';
import { CreateMovementModal } from './CreateMovementModal';

/**
 * Página de búsqueda de productos mejorada
 * @returns Componente SearchProducts
 */
/**
 * Componente para el tab de historial de movimientos
 */
const ProductHistoryTab = ({ 
  product, 
  warehouseId, 
  warehouses,
  onCreateMovement
}: { 
  product: Product; 
  warehouseId: number | null; 
  warehouses: Warehouse[];
  onCreateMovement: () => void;
}): React.ReactElement => {
  const [selectedType, setSelectedType] = useState<MovementType | ''>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['productHistory', product.id, warehouseId, selectedType, startDate, endDate],
    queryFn: async () => {
      return await stockMovementsService.getProductHistory({
        productId: product.codigo || product.id?.toString() || '',
        warehouseId: warehouseId || undefined,
        movementType: selectedType || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        limit: 100
      });
    },
    enabled: !!product.id || !!product.codigo,
    staleTime: 1000 * 60 * 2
  });

  const movements = historyData?.data || [];
  const currentStock = historyData?.currentStock || 0;
  const totalMovements = historyData?.total || 0;

  const typeOptions = [
    { value: '', label: 'Todos los tipos' },
    { value: MovementType.ENTRADA, label: 'Entrada' },
    { value: MovementType.SALIDA, label: 'Salida' },
    { value: MovementType.AJUSTE, label: 'Ajuste' },
    { value: MovementType.TRANSFERENCIA, label: 'Transferencia' }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex-1 flex flex-col min-h-0">
        <div className="mb-4 space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Historial de Movimientos
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <p>
                Producto: <span className="font-medium">{product.codigo} - {product.nombre}</span>
              </p>
              {warehouseId && (
                <p>
                  Bodega: <span className="font-medium">{warehouses.find(w => w.id === warehouseId)?.nombre}</span>
                </p>
              )}
              <p className="ml-auto">
                Stock Actual: <span className="font-bold text-blue-600">{currentStock.toLocaleString('es-CL')}</span>
              </p>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={onCreateMovement}
                className="px-4 py-2 text-white bg-[#004BB7] rounded-lg hover:bg-[#003a8f] flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear Movimiento
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-4 items-end">
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Movimiento
              </label>
              <Select
                id="movement-type-filter"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as MovementType | '')}
                options={typeOptions}
                placeholder="Todos"
              />
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Desde
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="text-sm text-gray-500">
              Total: {totalMovements} movimientos
            </div>
          </div>
        </div>

        {/* Tabla de movimientos */}
        <div className="flex-1 min-h-0">
          <DataTablePage
            data={movements}
            columns={historyColumns}
            isLoading={isLoadingHistory}
            errorMessage="Error al cargar historial de movimientos"
          />
        </div>
      </div>
    </div>
  );
};

export const SearchProducts = (): React.ReactElement => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
  const [includeLots, setIncludeLots] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<string>('search');
  const [isCreateMovementModalOpen, setIsCreateMovementModalOpen] = useState(false);

  /**
   * Obtiene las bodegas disponibles
   */
  const { data: warehousesData, isLoading: isLoadingWarehouses, error: warehousesError } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => await warehousesService.getAllWarehouses(),
    staleTime: 1000 * 60 * 10,
    retry: 1
  });

  const warehouses = warehousesData?.data || [];

  // WebSocket para eventos de movimientos de stock (invalidación automática de queries)
  useStockMovementsWebSocket();

  /**
   * Busca productos cuando hay un término de búsqueda
   */
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', 'search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return { data: [], total: 0 };
      }
      const products = await productsService.searchProducts(searchTerm.trim(), 50);
      return { data: products, total: products.length };
    },
    enabled: searchTerm.trim().length >= 2,
    staleTime: 1000 * 60 * 2
  });

  const products = productsData?.data || [];

  /**
   * Filtra productos por bodega si está seleccionada
   */
  const filteredProducts = useMemo(() => {
    if (!selectedWarehouseId) {
      return products;
    }
    return products;
  }, [products, selectedWarehouseId]);

  /**
   * Maneja la selección de un producto
   */
  const handleProductSelect = (product: Product): void => {
    setSelectedProduct(product);
    setActiveTab('history');
  };

  /**
   * Tabs de la página
   */
  const tabs: TabItem[] = [
    {
      id: 'search',
      label: 'Búsqueda',
      content: (
        <DataTablePage<Product>
          data={filteredProducts}
          columns={columns}
          isLoading={isLoading}
          onRowClick={(row) => handleProductSelect(row.original)}
          errorMessage="Error al buscar productos"
        />
      )
    },
    {
      id: 'history',
      label: 'Historial',
      content: selectedProduct ? (
        <ProductHistoryTab
          product={selectedProduct}
          warehouseId={selectedWarehouseId}
          warehouses={warehouses}
          onCreateMovement={() => setIsCreateMovementModalOpen(true)}
        />
      ) : (
        <div className="h-full flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center max-w-md">
            <div className="text-gray-400 mb-4">
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium mb-2">No hay producto seleccionado</p>
            <p className="text-sm text-gray-500">
              Selecciona un producto de la tabla para ver su historial de movimientos de stock
            </p>
          </div>
        </div>
      )
    }
  ];

  /**
   * Opciones de bodega para el select
   */
  const warehouseOptions = [
    { value: '', label: 'Todas las bodegas' },
    ...warehouses.map(w => ({
      value: w.id.toString(),
      label: `${w.codigoCorto || w.codigo} - ${w.nombre}`
    }))
  ];

  return (
    <div className="w-full h-full flex flex-col p-8">
      <PageHeader title="Búsqueda de Productos" />

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-w-0">
          {/* Barra de búsqueda y filtros */}
          <div className="mb-4 space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                {/* Búsqueda principal */}
                <div>
                  <SearchBar
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Buscar productos por código, nombre o SKU..."
                    filterChips={[]}
                    className="mb-0"
                  />
                </div>

                {/* Filtros */}
                <div className="flex gap-4 items-end">
                <div className="w-80">
                  <Select
                    id="warehouse-filter"
                    label="Filtrar por bodega"
                    value={selectedWarehouseId?.toString() || ''}
                    onChange={(e) => setSelectedWarehouseId(e.target.value ? parseInt(e.target.value, 10) : null)}
                    options={warehouseOptions}
                    placeholder={warehouses.length === 0 ? "No hay bodegas disponibles" : "Todas las bodegas"}
                    disabled={warehouses.length === 0}
                  />
                  {isLoadingWarehouses && (
                    <p className="text-xs text-gray-400 mt-1">
                      Cargando bodegas...
                    </p>
                  )}
                  {!isLoadingWarehouses && warehouses.length === 0 && !warehousesError && (
                    <p className="text-xs text-amber-600 mt-1">
                      No hay bodegas disponibles. Contacta al administrador.
                    </p>
                  )}
                  {warehousesError && (
                    <p className="text-xs text-red-600 mt-1">
                      Error al cargar bodegas. Intenta recargar la página.
                    </p>
                  )}
                </div>
                  <div className="pb-2">
                    <Toggle
                      id="include-lots"
                      checked={includeLots}
                      onChange={(e) => setIncludeLots(e.target.checked)}
                      label="Incluir lotes"
                    />
                  </div>
                  {searchTerm.trim().length >= 2 && (
                    <div className="ml-auto pb-2">
                      <span className="text-sm text-gray-600">
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información del producto seleccionado */}
            {selectedProduct && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {selectedProduct.codigo.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {selectedProduct.codigo} - {selectedProduct.nombre}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          {selectedProduct.sku && selectedProduct.sku !== selectedProduct.codigo && (
                            <p className="text-sm text-gray-600">SKU: {selectedProduct.sku}</p>
                          )}
                          {selectedProduct.stock !== undefined && (
                            <p className={`text-sm font-medium ${selectedProduct.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              Stock: {selectedProduct.stock}
                            </p>
                          )}
                          {selectedProduct.precio && (
                            <p className="text-sm text-gray-600">
                              Precio: ${selectedProduct.precio.toLocaleString('es-CL')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {selectedWarehouseId && (
                    <div className="ml-4 text-right">
                      <p className="text-xs text-gray-500 mb-1">Bodega seleccionada</p>
                      <p className="text-sm font-medium text-gray-900">
                        {warehouses.find(w => w.id === selectedWarehouseId)?.nombre}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex-1 min-h-0 flex flex-col">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              containerClassName="flex-1 min-h-0"
            />
          </div>
        </div>
      </div>

      {/* Modal para crear movimientos */}
      <CreateMovementModal
        isOpen={isCreateMovementModalOpen}
        onClose={() => setIsCreateMovementModalOpen(false)}
        product={selectedProduct}
        warehouses={warehouses}
        onSuccess={() => {
          // El historial se actualizará automáticamente por la invalidación de queries
        }}
      />
    </div>
  );
};

