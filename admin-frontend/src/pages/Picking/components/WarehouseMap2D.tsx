import { useRef, useEffect, useState, useCallback } from 'react';
import type { WarehouseProduct, WarehouseZone, WarehouseMapConfig } from '../types/warehouse';

interface WarehouseMap2DProps {
  config: WarehouseMapConfig;
  zones: WarehouseZone[];
  products: WarehouseProduct[];
  selectedProduct: WarehouseProduct | null;
  onProductSelect: (product: WarehouseProduct) => void;
}

/**
 * Componente para renderizar el mapa 2D de la bodega
 * @param props - Props del componente WarehouseMap2D
 * @returns Componente WarehouseMap2D
 */
export const WarehouseMap2D = ({
  config,
  zones,
  products,
  selectedProduct,
  onProductSelect
}: WarehouseMap2DProps): React.ReactElement => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: config.offsetX, y: config.offsetY });

  /**
   * Convierte coordenadas del mundo real a coordenadas SVG
   */
  const worldToSVG = useCallback((x: number, y: number): { x: number; y: number } => {
    return {
      x: (x * config.scale) + offset.x + (config.width / 2),
      y: (y * config.scale) + offset.y + (config.height / 2)
    };
  }, [config, offset]);

  /**
   * Convierte coordenadas SVG a coordenadas del mundo real
   */
  const svgToWorld = useCallback((x: number, y: number): { x: number; y: number } => {
    return {
      x: (x - offset.x - (config.width / 2)) / config.scale,
      y: (y - offset.y - (config.height / 2)) / config.scale
    };
  }, [config, offset]);

  /**
   * Maneja el inicio del arrastre
   */
  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>): void => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  }, [offset]);

  /**
   * Maneja el arrastre
   */
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>): void => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  /**
   * Maneja el fin del arrastre
   */
  const handleMouseUp = useCallback((): void => {
    setIsDragging(false);
  }, []);

  /**
   * Maneja el click en un producto
   */
  const handleProductClick = useCallback((product: WarehouseProduct, e: React.MouseEvent): void => {
    e.stopPropagation();
    onProductSelect(product);
  }, [onProductSelect]);

  /**
   * Actualiza el offset cuando cambia la configuración
   */
  useEffect(() => {
    setOffset({ x: config.offsetX, y: config.offsetY });
  }, [config.offsetX, config.offsetY]);

  return (
    <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden relative">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${config.width} ${config.height}`}
        className="cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Fondo con grid */}
        <defs>
          <pattern
            id="grid"
            width={config.gridSize * config.scale}
            height={config.gridSize * config.scale}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${config.gridSize * config.scale} 0 L 0 0 0 ${config.gridSize * config.scale}`}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Ejes cartesianos */}
        <line
          x1={config.width / 2 + offset.x}
          y1={0}
          x2={config.width / 2 + offset.x}
          y2={config.height}
          stroke="#9CA3AF"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
        <line
          x1={0}
          y1={config.height / 2 + offset.y}
          x2={config.width}
          y2={config.height / 2 + offset.y}
          stroke="#9CA3AF"
          strokeWidth="2"
          strokeDasharray="5,5"
        />

        {/* Etiquetas de ejes */}
        <text
          x={config.width / 2 + offset.x + 5}
          y={15}
          fill="#6B7280"
          fontSize="12"
          fontWeight="bold"
        >
          Y
        </text>
        <text
          x={config.width - 20}
          y={config.height / 2 + offset.y - 5}
          fill="#6B7280"
          fontSize="12"
          fontWeight="bold"
        >
          X
        </text>

        {/* Renderizar zonas */}
        {zones.map((zone) => {
          const svgCoords = worldToSVG(zone.coordinates.x, zone.coordinates.y);
          return (
            <g key={zone.id}>
              <rect
                x={svgCoords.x}
                y={svgCoords.y}
                width={zone.width * config.scale}
                height={zone.height * config.scale}
                fill={zone.color || '#F3F4F6'}
                stroke="#D1D5DB"
                strokeWidth="2"
                opacity="0.7"
              />
              <text
                x={svgCoords.x + (zone.width * config.scale) / 2}
                y={svgCoords.y + (zone.height * config.scale) / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#374151"
                fontSize="14"
                fontWeight="bold"
              >
                {zone.name}
              </text>
            </g>
          );
        })}

        {/* Renderizar productos */}
        {products.map((product) => {
          const svgCoords = worldToSVG(product.coordinates.x, product.coordinates.y);
          const isSelected = selectedProduct?.id === product.id;
          const stockColor = product.stock > 100 ? '#10B981' : product.stock > 50 ? '#F59E0B' : '#EF4444';

          return (
            <g
              key={product.id}
              onClick={(e) => handleProductClick(product, e)}
              className="cursor-pointer"
            >
              {/* Círculo del producto */}
              <circle
                cx={svgCoords.x}
                cy={svgCoords.y}
                r={isSelected ? 12 : 8}
                fill={stockColor}
                stroke={isSelected ? '#3B82F6' : '#FFFFFF'}
                strokeWidth={isSelected ? 3 : 2}
                opacity="0.9"
              />
              {/* Etiqueta del producto */}
              {isSelected && (
                <g>
                  <rect
                    x={svgCoords.x + 15}
                    y={svgCoords.y - 30}
                    width={120}
                    height={50}
                    fill="#FFFFFF"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    rx="4"
                  />
                  <text
                    x={svgCoords.x + 20}
                    y={svgCoords.y - 12}
                    fill="#1F2937"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {product.name}
                  </text>
                  <text
                    x={svgCoords.x + 20}
                    y={svgCoords.y + 2}
                    fill="#6B7280"
                    fontSize="10"
                  >
                    {product.code}
                  </text>
                  <text
                    x={svgCoords.x + 20}
                    y={svgCoords.y + 15}
                    fill="#3B82F6"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    Stock: {product.stock}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Línea desde el producto seleccionado hasta el origen (opcional) */}
        {selectedProduct && (
          <line
            x1={config.width / 2 + offset.x}
            y1={config.height / 2 + offset.y}
            x2={worldToSVG(selectedProduct.coordinates.x, selectedProduct.coordinates.y).x}
            y2={worldToSVG(selectedProduct.coordinates.x, selectedProduct.coordinates.y).y}
            stroke="#3B82F6"
            strokeWidth="1"
            strokeDasharray="3,3"
            opacity="0.5"
          />
        )}
      </svg>

      {/* Leyenda */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Leyenda</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Stock &gt; 100</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-600">Stock 50-100</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600">Stock &lt; 50</span>
          </div>
        </div>
      </div>

      {/* Coordenadas del cursor (opcional) */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 text-xs text-gray-600">
        <div>Arrastra para mover el mapa</div>
        <div className="mt-1 text-gray-400">Usa la rueda del mouse para zoom</div>
      </div>
    </div>
  );
};

