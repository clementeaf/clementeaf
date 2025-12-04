import { useState, useMemo } from 'react';
import { WarehouseMap3D } from '../components/WarehouseMap3D';
import { Input, InputNumber, Button } from '../../../components/commons';
import type { WarehouseProduct, WarehouseZone, WarehouseShelf, WarehouseMapConfig, WarehouseCoordinates3D } from '../types/warehouse';

/**
 * Componente de sección del Mapa de Bodega
 * @returns Componente WarehouseMapSection
 */
export const WarehouseMapSection = (): React.ReactElement => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<WarehouseProduct | null>(null);
  const [zoom] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [clickedPosition, setClickedPosition] = useState<WarehouseCoordinates3D | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  
  // Formulario para crear/editar producto
  const [productForm, setProductForm] = useState({
    name: '',
    code: '',
    x: 0,
    y: 0,
    z: 0,
    stock: 0,
    shelfId: '',
    level: 1
  });

  /**
   * Configuración inicial del mapa 3D - vista tipo mapa aérea
   */
  const mapConfig: WarehouseMapConfig = useMemo(() => ({
    width: 1000,
    height: 800,
    gridSize: 50,
    scale: zoom,
    cameraPosition: { x: 300, y: 400, z: 300 },
    cameraRotation: { x: 0, y: 0, z: 0 }
  }), [zoom]);

  /**
   * Zonas de la bodega (datos de ejemplo en 3D)
   */
  const zones: WarehouseZone[] = useMemo(() => [
    {
      id: 'zone-a',
      name: 'Zona A',
      coordinates: { x: 0, y: 0, z: 0 },
      width: 200,
      height: 100,
      depth: 200,
      color: '#E3F2FD'
    },
    {
      id: 'zone-b',
      name: 'Zona B',
      coordinates: { x: 250, y: 0, z: 0 },
      width: 200,
      height: 100,
      depth: 200,
      color: '#F3E5F5'
    },
    {
      id: 'zone-c',
      name: 'Zona C',
      coordinates: { x: 500, y: 0, z: 0 },
      width: 200,
      height: 100,
      depth: 200,
      color: '#E8F5E9'
    },
    {
      id: 'zone-d',
      name: 'Zona D',
      coordinates: { x: 0, y: 0, z: 250 },
      width: 200,
      height: 100,
      depth: 200,
      color: '#FFF3E0'
    }
  ], []);

  /**
   * Repisas de la bodega (datos de ejemplo)
   */
  const shelves: WarehouseShelf[] = useMemo(() => [
    {
      id: 'shelf-1',
      name: 'Repisa A1',
      coordinates: { x: 30, y: 0, z: 30 },
      width: 70,
      height: 60,
      depth: 40,
      levels: 3,
      color: '#D1D5DB',
      zoneId: 'zone-a'
    },
    {
      id: 'shelf-2',
      name: 'Repisa A2',
      coordinates: { x: 110, y: 0, z: 30 },
      width: 70,
      height: 60,
      depth: 40,
      levels: 3,
      color: '#D1D5DB',
      zoneId: 'zone-a'
    },
    {
      id: 'shelf-3',
      name: 'Repisa B1',
      coordinates: { x: 280, y: 0, z: 30 },
      width: 70,
      height: 60,
      depth: 40,
      levels: 4,
      color: '#D1D5DB',
      zoneId: 'zone-b'
    },
    {
      id: 'shelf-4',
      name: 'Repisa C1',
      coordinates: { x: 530, y: 0, z: 30 },
      width: 70,
      height: 60,
      depth: 40,
      levels: 3,
      color: '#D1D5DB',
      zoneId: 'zone-c'
    }
  ], []);

  /**
   * Productos en la bodega con coordenadas 3D (datos de ejemplo)
   */
  const [products, setProducts] = useState<WarehouseProduct[]>([
    {
      id: '1',
      name: 'Producto A',
      code: 'PROD-001',
      coordinates: { x: 70, y: 15, z: 60 },
      stock: 100,
      zoneId: 'zone-a',
      shelfId: 'shelf-1',
      level: 1,
      location: 'Zona-A-Repisa-1-Nivel-1'
    },
    {
      id: '2',
      name: 'Producto B',
      code: 'PROD-002',
      coordinates: { x: 70, y: 35, z: 60 },
      stock: 50,
      zoneId: 'zone-a',
      shelfId: 'shelf-1',
      level: 2,
      location: 'Zona-A-Repisa-1-Nivel-2'
    },
    {
      id: '3',
      name: 'Producto C',
      code: 'PROD-003',
      coordinates: { x: 170, y: 15, z: 60 },
      stock: 75,
      zoneId: 'zone-a',
      shelfId: 'shelf-2',
      level: 1,
      location: 'Zona-A-Repisa-2-Nivel-1'
    },
    {
      id: '4',
      name: 'Producto D',
      code: 'PROD-004',
      coordinates: { x: 320, y: 25, z: 60 },
      stock: 200,
      zoneId: 'zone-b',
      shelfId: 'shelf-3',
      level: 2,
      location: 'Zona-B-Repisa-1-Nivel-2'
    },
    {
      id: '5',
      name: 'Producto E',
      code: 'PROD-005',
      coordinates: { x: 570, y: 15, z: 60 },
      stock: 150,
      zoneId: 'zone-c',
      shelfId: 'shelf-4',
      level: 1,
      location: 'Zona-C-Repisa-1-Nivel-1'
    }
  ]);

  /**
   * Filtra productos por término de búsqueda o coordenadas
   */
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return products;
    }
    const search = searchTerm.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(search) ||
      product.code.toLowerCase().includes(search) ||
      product.location?.toLowerCase().includes(search) ||
      `${product.coordinates.x},${product.coordinates.y},${product.coordinates.z}`.includes(search)
    );
  }, [products, searchTerm]);


  /**
   * Maneja la selección de un producto
   */
  const handleProductSelect = (product: WarehouseProduct): void => {
    setSelectedProduct(product);
    setSearchTerm('');
    setIsCreatingProduct(false);
    setProductForm({
      name: product.name,
      code: product.code,
      x: product.coordinates.x,
      y: product.coordinates.y,
      z: product.coordinates.z,
      stock: product.stock,
      shelfId: product.shelfId || '',
      level: product.level || 1
    });
  };

  /**
   * Maneja el click en el mapa para colocar productos
   */
  const handleMapClick = (position: WarehouseCoordinates3D): void => {
    if (isEditMode) {
      setClickedPosition(position);
      setProductForm(prev => ({
        ...prev,
        x: Math.round(position.x),
        y: Math.round(position.y),
        z: Math.round(position.z)
      }));
      setIsCreatingProduct(true);
      setSelectedProduct(null);
    }
  };

  /**
   * Guarda un nuevo producto o actualiza uno existente
   */
  const handleSaveProduct = (): void => {
    if (!productForm.name.trim() || !productForm.code.trim()) {
      alert('Por favor completa el nombre y código del producto');
      return;
    }

    if (selectedProduct) {
      // Actualizar producto existente
      setProducts(prev => prev.map(p => 
        p.id === selectedProduct.id
          ? {
              ...p,
              name: productForm.name,
              code: productForm.code,
              coordinates: { x: productForm.x, y: productForm.y, z: productForm.z },
              stock: productForm.stock,
              shelfId: productForm.shelfId || undefined,
              level: productForm.level
            }
          : p
      ));
      alert('Producto actualizado correctamente');
    } else {
      // Crear nuevo producto
      const newProduct: WarehouseProduct = {
        id: Date.now().toString(),
        name: productForm.name,
        code: productForm.code,
        coordinates: { x: productForm.x, y: productForm.y, z: productForm.z },
        stock: productForm.stock,
        shelfId: productForm.shelfId || undefined,
        level: productForm.level,
        location: `X:${productForm.x} Y:${productForm.y} Z:${productForm.z}`
      };
      setProducts(prev => [...prev, newProduct]);
      alert('Producto creado correctamente');
    }

    // Limpiar formulario
    setProductForm({
      name: '',
      code: '',
      x: 0,
      y: 0,
      z: 0,
      stock: 0,
      shelfId: '',
      level: 1
    });
    setIsCreatingProduct(false);
    setSelectedProduct(null);
    setClickedPosition(null);
  };

  /**
   * Cancela la edición
   */
  const handleCancelEdit = (): void => {
    setProductForm({
      name: '',
      code: '',
      x: 0,
      y: 0,
      z: 0,
      stock: 0,
      shelfId: '',
      level: 1
    });
    setIsCreatingProduct(false);
    setSelectedProduct(null);
    setClickedPosition(null);
  };

  /**
   * Busca un producto por coordenadas
   */
  const handleSearchByCoordinates = (): void => {
    const coords = prompt('Ingresa las coordenadas (formato: X,Y,Z)\nEjemplo: 70,15,60');
    if (coords) {
      const [x, y, z] = coords.split(',').map(Number);
      if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
        const found = products.find(p => 
          Math.abs(p.coordinates.x - x) < 5 &&
          Math.abs(p.coordinates.y - y) < 5 &&
          Math.abs(p.coordinates.z - z) < 5
        );
        if (found) {
          handleProductSelect(found);
        } else {
          alert(`No se encontró ningún producto en las coordenadas (${x}, ${y}, ${z})`);
        }
      } else {
        alert('Formato incorrecto. Usa: X,Y,Z');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex-1 flex flex-col min-h-0">
        {/* Header con controles principales */}
        <div className="mb-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Mapa de Bodega 3D</h3>
            <p className="text-sm text-gray-500">
              {isEditMode 
                ? 'Modo Edición: Haz click en el mapa para colocar un producto'
                : 'Visualiza y busca productos en la bodega'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isEditMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isEditMode ? '✏️ Modo Edición' : '👁️ Modo Visualización'}
            </button>
            <button
              onClick={handleSearchByCoordinates}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              🔍 Buscar por Coordenadas
            </button>
          </div>
        </div>

        <div className="flex gap-4 flex-1 min-h-0">
          {/* Panel lateral */}
          <div className="w-96 flex-shrink-0 flex flex-col border-r border-gray-200 pr-4">
            {/* Búsqueda */}
            <div className="mb-4">
              <Input
                id="search-products"
                type="text"
                placeholder="Buscar por nombre, código o coordenadas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                inputClassName="w-full"
              />
            </div>

            {/* Formulario de creación/edición */}
            {(isCreatingProduct || selectedProduct) && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  {selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h4>
                <div className="space-y-3">
                  <Input
                    id="product-name"
                    label="Nombre del Producto *"
                    value={productForm.name}
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Producto XYZ"
                    inputClassName="w-full"
                  />
                  <Input
                    id="product-code"
                    label="Código *"
                    value={productForm.code}
                    onChange={(e) => setProductForm(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="Ej: PROD-001"
                    inputClassName="w-full"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <InputNumber
                      id="coord-x"
                      label="X (Ancho)"
                      value={productForm.x}
                      onChange={(e) => setProductForm(prev => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
                      inputClassName="w-full"
                    />
                    <InputNumber
                      id="coord-y"
                      label="Y (Altura)"
                      value={productForm.y}
                      onChange={(e) => setProductForm(prev => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
                      inputClassName="w-full"
                    />
                    <InputNumber
                      id="coord-z"
                      label="Z (Profundidad)"
                      value={productForm.z}
                      onChange={(e) => setProductForm(prev => ({ ...prev, z: parseInt(e.target.value) || 0 }))}
                      inputClassName="w-full"
                    />
                  </div>
                  <InputNumber
                    id="product-stock"
                    label="Stock"
                    value={productForm.stock}
                    onChange={(e) => setProductForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                    min={0}
                    inputClassName="w-full"
                  />
                  <InputNumber
                    id="product-level"
                    label="Nivel en Repisa"
                    value={productForm.level}
                    onChange={(e) => setProductForm(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                    min={1}
                    inputClassName="w-full"
                  />
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleSaveProduct}
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {selectedProduct ? 'Guardar Cambios' : 'Crear Producto'}
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Botón para crear nuevo producto */}
            {!isCreatingProduct && !selectedProduct && (
              <div className="mb-4">
                <Button
                  onClick={() => {
                    setIsCreatingProduct(true);
                    setProductForm({
                      name: '',
                      code: '',
                      x: 0,
                      y: 0,
                      z: 0,
                      stock: 0,
                      shelfId: '',
                      level: 1
                    });
                  }}
                  className="w-full bg-green-600 text-white hover:bg-green-700"
                >
                  ➕ Crear Nuevo Producto
                </Button>
              </div>
            )}

            {/* Lista de productos */}
            <div className="flex-1 overflow-y-auto">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Productos ({filteredProducts.length})
              </h4>
              <div className="space-y-2">
                {filteredProducts.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No se encontraron productos
                  </p>
                ) : (
                  filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedProduct?.id === product.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {product.code}
                          </p>
                          <p className="text-xs text-gray-600 mt-1 font-mono">
                            📍 ({product.coordinates.x}, {product.coordinates.y}, {product.coordinates.z})
                          </p>
                          {product.level && (
                            <p className="text-xs text-blue-600 mt-1">
                              Nivel: {product.level}
                            </p>
                          )}
                          <p className="text-xs text-green-600 mt-1 font-medium">
                            Stock: {product.stock}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Área del mapa 3D */}
          <div className="flex-1 flex flex-col min-w-0">
            <WarehouseMap3D
              config={mapConfig}
              zones={zones}
              shelves={shelves}
              products={products}
              selectedProduct={selectedProduct}
              onProductSelect={handleProductSelect}
              isEditMode={isEditMode}
              clickedPosition={clickedPosition}
              onMapClick={handleMapClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
