/**
 * DTO para crear un cliente
 */
export interface CreateClientDto {
  // Paso 1: Información del Cliente
  rut: string;
  razonSocial: string;
  nombreCliente: string;
  rutCompleto: string;
  giro: string;
  sitioWeb?: string;

  // Paso 2: Segmentación
  propietarioCliente?: string;
  tamanoEmpresa?: string;
  segmento?: string;
  subsegmento?: string;
  empleados?: number;
  tratos?: string;

  // Paso 3: Facturación
  documentoPorDefecto?: string;
  formaPago?: string;
  listaPrecios?: string;
  ingresosAnuales?: number;
  limiteCredito?: number;
  creditoUsado?: number;
  motivoBloqueo?: string;
  respaldoRUT?: string;
  clienteExigeOC?: boolean;
  aprobadoPorFinanzas?: boolean;

  // Paso 4: Contacto
  contactoNombre?: string;
  contactoCargo?: string;
  contactoCorreoElectronico?: string;
  contactoTelefono?: string;
  contactoCountryCode?: string;
  contactoCountryDialCode?: string;

  // Paso 5: Dirección de Facturación
  direccionFacturacion?: string;
  regionFacturacion?: string;
  comunaFacturacion?: string;
  codigoPostalFacturacion?: string;

  // Paso 5: Dirección de Despacho
  direccionDespacho?: string;
  regionDespacho?: string;
  comunaDespacho?: string;
  codigoPostalDespacho?: string;
  usarMismaDireccion?: boolean;
}

