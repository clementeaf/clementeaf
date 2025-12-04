/**
 * Coordenadas 3D en el espacio de la bodega
 */
export interface WarehouseCoordinates3D {
  x: number; // Posición horizontal (ancho)
  y: number; // Posición vertical (altura/nivel)
  z: number; // Posición de profundidad (largo)
}

/**
 * Repisa o estante en la bodega
 */
export interface WarehouseShelf {
  id: string;
  name: string;
  coordinates: WarehouseCoordinates3D;
  width: number;   // Ancho de la repisa
  height: number;  // Altura de la repisa
  depth: number;   // Profundidad de la repisa
  levels: number;  // Número de niveles/alturas en la repisa
  color?: string;
  zoneId?: string;
}

/**
 * Zona o sección de la bodega
 */
export interface WarehouseZone {
  id: string;
  name: string;
  coordinates: WarehouseCoordinates3D;
  width: number;
  height: number;
  depth: number;
  color?: string;
}

/**
 * Producto ubicado en la bodega con coordenadas 3D
 */
export interface WarehouseProduct {
  id: string;
  name: string;
  code: string;
  coordinates: WarehouseCoordinates3D;
  stock: number;
  zoneId?: string;
  shelfId?: string;
  level?: number; // Nivel en la repisa (1, 2, 3, etc.)
  location?: string; // Formato: "Zona-A-Repisa-1-Nivel-2"
}

/**
 * Configuración del mapa 3D de la bodega
 */
export interface WarehouseMapConfig {
  width: number;
  height: number;
  gridSize: number;
  scale: number;
  cameraPosition: { x: number; y: number; z: number };
  cameraRotation: { x: number; y: number; z: number };
}

