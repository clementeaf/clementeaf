/**
 * DTO para crear una orden de compra
 */
export interface CreateQuoteDto {
  // Paso 1: Información del Cliente
  clienteNombre: string;
  direccionFacturacion?: string;
  telefono?: string;
  regionComunaCodigo?: string;
  asesorAsignado?: string;
  contactoNombre?: string;
  contactoTelefono?: string;
  contactoEmail?: string;
  countryCode?: string;
  countryDialCode?: string;
  contactoCountryCode?: string;
  contactoCountryDialCode?: string;

  // Paso 2: Condiciones
  numeroCotizacion?: string;
  fecha?: string; // Formato: YYYY-MM-DD
  terminosPago?: string;
  numeroReferencia?: string;
  centroCosto?: string;
  listaPrecios?: string;
  sinCostoEnvio?: boolean;

  // Paso 3: Productos (JSON string)
  productos?: string;

  // Estado
  estado?: string;
  
  // Estado de picking
  estadoPicking?: string;
}

/**
 * DTO para actualizar una orden de compra
 */
export interface UpdateQuoteDto extends Partial<CreateQuoteDto> {}

