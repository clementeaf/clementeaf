import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { WarehouseProduct, WarehouseZone, WarehouseShelf, WarehouseMapConfig, WarehouseCoordinates3D } from '../types/warehouse';

interface WarehouseMap3DProps {
  config: WarehouseMapConfig;
  zones: WarehouseZone[];
  shelves: WarehouseShelf[];
  products: WarehouseProduct[];
  selectedProduct: WarehouseProduct | null;
  onProductSelect: (product: WarehouseProduct) => void;
  isEditMode?: boolean;
  clickedPosition?: WarehouseCoordinates3D | null;
  onMapClick?: (position: WarehouseCoordinates3D) => void;
}

/**
 * Componente para renderizar una zona de la bodega
 */
const Zone3D = ({ zone }: { zone: WarehouseZone }): React.ReactElement => {
  return (
    <group position={[zone.coordinates.x, zone.coordinates.y, zone.coordinates.z]}>
      <mesh position={[zone.width / 2, zone.height / 2, zone.depth / 2]}>
        <boxGeometry args={[zone.width, zone.height, zone.depth]} />
        <meshStandardMaterial
          color={zone.color || '#E3F2FD'}
          transparent
          opacity={0.3}
          wireframe={false}
        />
      </mesh>
      <mesh position={[zone.width / 2, zone.height + 5, zone.depth / 2]}>
        <Text
          fontSize={20}
          color="#374151"
          anchorX="center"
          anchorY="middle"
        >
          {zone.name}
        </Text>
      </mesh>
    </group>
  );
};

/**
 * Componente para renderizar una repisa con niveles
 */
const Shelf3D = ({ shelf }: { shelf: WarehouseShelf }): React.ReactElement => {
  const shelfHeight = shelf.height / shelf.levels;
  
  return (
    <group position={[shelf.coordinates.x, shelf.coordinates.y, shelf.coordinates.z]}>
      {/* Estructura de la repisa */}
      <mesh position={[shelf.width / 2, shelf.height / 2, shelf.depth / 2]}>
        <boxGeometry args={[shelf.width, shelf.height, shelf.depth]} />
        <meshStandardMaterial
          color="#D1D5DB"
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      
      {/* Niveles de la repisa */}
      {Array.from({ length: shelf.levels }).map((_, index) => {
        const levelY = (index + 1) * shelfHeight;
        return (
          <mesh
            key={index}
            position={[shelf.width / 2, levelY, shelf.depth / 2]}
          >
            <boxGeometry args={[shelf.width - 2, 2, shelf.depth - 2]} />
            <meshStandardMaterial color="#9CA3AF" />
          </mesh>
        );
      })}
      
      {/* Etiqueta de la repisa */}
      <mesh position={[shelf.width / 2, shelf.height + 3, shelf.depth / 2]}>
        <Text
          fontSize={12}
          color="#6B7280"
          anchorX="center"
          anchorY="middle"
        >
          {shelf.name}
        </Text>
      </mesh>
    </group>
  );
};

/**
 * Componente para renderizar un producto en 3D
 */
const Product3D = ({
  product,
  isSelected,
  onClick
}: {
  product: WarehouseProduct;
  isSelected: boolean;
  onClick: () => void;
}): React.ReactElement => {
  const meshRef = useRef<THREE.Mesh>(null);
  const stockColor = product.stock > 100 ? '#10B981' : product.stock > 50 ? '#F59E0B' : '#EF4444';
  
  // Animación de rotación suave
  useFrame(() => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group
      position={[product.coordinates.x, product.coordinates.y, product.coordinates.z]}
      onClick={onClick}
    >
      <mesh ref={meshRef}>
        <boxGeometry args={[5, 5, 5]} />
        <meshStandardMaterial
          color={stockColor}
          metalness={0.5}
          roughness={0.5}
          emissive={isSelected ? stockColor : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>
      
      {/* Etiqueta del producto cuando está seleccionado */}
      {isSelected && (
        <mesh position={[0, 8, 0]}>
          <Text
            fontSize={10}
            color="#1F2937"
            anchorX="center"
            anchorY="middle"
            maxWidth={100}
          >
            {product.name}
          </Text>
        </mesh>
      )}
    </group>
  );
};

/**
 * Componente para detectar clicks en el mapa usando raycaster
 */
const MapClickHandler = ({
  isEditMode,
  onMapClick
}: {
  isEditMode: boolean;
  onMapClick?: (position: WarehouseCoordinates3D) => void;
}): React.ReactElement => {
  const { camera, gl, raycaster } = useThree();
  const planeRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!isEditMode || !onMapClick) return;

    const handleClick = (event: MouseEvent): void => {
      if (!planeRef.current) return;

      const rect = gl.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(planeRef.current);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        onMapClick({
          x: Math.round(point.x),
          y: Math.round(Math.max(0, point.y)),
          z: Math.round(point.z)
        });
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    return () => {
      gl.domElement.removeEventListener('click', handleClick);
    };
  }, [isEditMode, onMapClick, camera, gl, raycaster]);

  return (
    <mesh ref={planeRef} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <planeGeometry args={[2000, 2000]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
};

/**
 * Componente para mostrar indicador de posición clickeada
 */
const ClickedPositionIndicator = ({
  position
}: {
  position: WarehouseCoordinates3D | null;
}): React.ReactElement | null => {
  if (!position) return null;

  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh>
        <sphereGeometry args={[3, 16, 16]} />
        <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 8, 0]}>
        <Text
          fontSize={12}
          color="#3B82F6"
          anchorX="center"
          anchorY="middle"
        >
          ({position.x}, {position.y}, {position.z})
        </Text>
      </mesh>
    </group>
  );
};

/**
 * Componente principal del mapa 3D
 */
const WarehouseScene = ({
  zones,
  shelves,
  products,
  selectedProduct,
  onProductSelect,
  isEditMode,
  clickedPosition,
  onMapClick
}: Omit<WarehouseMap3DProps, 'config'>): React.ReactElement => {
  return (
    <>
      {/* Iluminación */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <directionalLight position={[-10, 10, -5]} intensity={0.4} />
      
      {/* Grid del suelo */}
      <Grid
        args={[1000, 1000]}
        cellColor="#E5E7EB"
        sectionColor="#D1D5DB"
        cellThickness={1}
        sectionThickness={2}
        fadeDistance={500}
        fadeStrength={1}
      />
      
      {/* Ejes de referencia */}
      <axesHelper args={[100]} />
      
      {/* Handler para clicks en modo edición */}
      {isEditMode && <MapClickHandler isEditMode={isEditMode} onMapClick={onMapClick} />}
      
      {/* Indicador de posición clickeada */}
      <ClickedPositionIndicator position={clickedPosition || null} />
      
      {/* Renderizar zonas */}
      {zones.map((zone) => (
        <Zone3D key={zone.id} zone={zone} />
      ))}
      
      {/* Renderizar repisas */}
      {shelves.map((shelf) => (
        <Shelf3D key={shelf.id} shelf={shelf} />
      ))}
      
      {/* Renderizar productos */}
      {products.map((product) => (
        <Product3D
          key={product.id}
          product={product}
          isSelected={selectedProduct?.id === product.id}
          onClick={() => onProductSelect(product)}
        />
      ))}
      
      {/* Controles de cámara */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={50}
        maxDistance={1000}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
};

/**
 * Componente para renderizar el mapa 3D de la bodega
 * @param props - Props del componente WarehouseMap3D
 * @returns Componente WarehouseMap3D
 */
export const WarehouseMap3D = ({
  config,
  zones,
  shelves,
  products,
  selectedProduct,
  onProductSelect,
  isEditMode = false,
  clickedPosition,
  onMapClick
}: WarehouseMap3DProps): React.ReactElement => {
  return (
    <div className="flex-1 bg-gray-900 rounded-lg border border-gray-200 overflow-hidden relative">
      <Canvas
        camera={{
          position: [config.cameraPosition.x, config.cameraPosition.y, config.cameraPosition.z],
          fov: 75
        }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <WarehouseScene
            zones={zones}
            shelves={shelves}
            products={products}
            selectedProduct={selectedProduct}
            onProductSelect={onProductSelect}
            isEditMode={isEditMode}
            clickedPosition={clickedPosition}
            onMapClick={onMapClick}
          />
        </Suspense>
      </Canvas>

      {/* Leyenda */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Leyenda</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600">Stock &gt; 100</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-gray-600">Stock 50-100</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-600">Stock &lt; 50</span>
          </div>
        </div>
      </div>

      {/* Controles de ayuda */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 text-xs text-gray-600">
        <div className="font-semibold mb-1">Controles:</div>
        <div>🖱️ Click + Arrastra: Rotar</div>
        <div>🖱️ Rueda: Zoom</div>
        <div>🖱️ Click derecho + Arrastra: Mover</div>
        {isEditMode && (
          <div className="mt-2 pt-2 border-t border-gray-200 text-blue-600 font-medium">
            ✏️ Modo Edición: Click en el mapa para colocar producto
          </div>
        )}
      </div>

      {/* Indicador de modo edición */}
      {isEditMode && (
        <div className="absolute top-4 left-4 bg-blue-600 text-white rounded-lg shadow-lg px-4 py-2 text-sm font-medium">
          ✏️ Modo Edición Activo
        </div>
      )}
    </div>
  );
};

