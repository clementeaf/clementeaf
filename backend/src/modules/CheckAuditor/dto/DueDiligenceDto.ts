/**
 * DTO para solicitud de Due Diligence
 */
export interface DueDiligenceDto {
  rut: string;
  tipo: 'cliente' | 'proveedor';
  incluirAntecedentes?: boolean;
  incluirRecomendaciones?: boolean;
}

