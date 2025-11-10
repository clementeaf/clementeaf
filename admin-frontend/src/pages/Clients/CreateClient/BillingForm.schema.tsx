/**
 * Tipo para definir un campo del formulario de facturación
 */
export interface BillingFormField {
  /**
   * Nombre del campo (key)
   */
  name: string;
  /**
   * Label del campo
   */
  label: string;
  /**
   * Tipo de campo: 'text', 'select', 'number', 'file', 'checkbox', 'textarea'
   */
  type?: 'text' | 'select' | 'number' | 'file' | 'checkbox' | 'textarea';
  /**
   * Valor por defecto
   */
  defaultValue?: string;
  /**
   * Placeholder
   */
  placeholder?: string;
  /**
   * Si el campo es requerido
   */
  required?: boolean;
  /**
   * Si el campo es opcional (se muestra en el label)
   */
  optional?: boolean;
  /**
   * Columna del grid (1 o 2)
   */
  colSpan?: 1 | 2;
  /**
   * Clases CSS adicionales para el contenedor
   */
  containerClassName?: string;
  /**
   * Clases CSS adicionales para el input
   */
  inputClassName?: string;
  /**
   * Opciones para select
   */
  options?: Array<{ value: string; label: string }>;
  /**
   * Prefijo para el input (ej: $)
   */
  prefix?: string;
  /**
   * Si es un checkbox, el texto del checkbox
   */
  checkboxLabel?: string;
  /**
   * Si es un file upload, las restricciones
   */
  fileConstraints?: {
    maxSize?: string;
    allowedFormats?: string[];
  };
  /**
   * Función de validación personalizada
   */
  validate?: (value: string) => string | null;
}

/**
 * Schema del formulario de facturación
 */
export const billingFormSchema: BillingFormField[] = [
  {
    name: 'documentoPorDefecto',
    label: 'Documento por defecto',
    type: 'select',
    placeholder: 'Selecciona una opción',
    colSpan: 1,
    inputClassName: 'bg-white',
    options: [
      { value: 'factura', label: 'Factura' },
      { value: 'boleta', label: 'Boleta' },
      { value: 'nota_credito', label: 'Nota de Crédito' }
    ]
  },
  {
    name: 'formaPago',
    label: 'Forma de pago',
    type: 'text',
    placeholder: 'Contado, Transferencia, Crédito',
    colSpan: 1,
    inputClassName: 'bg-white'
  },
  {
    name: 'listaPrecios',
    label: 'Lista de precios',
    type: 'text',
    placeholder: 'General, Mayorista, Distribuidor',
    colSpan: 1,
    inputClassName: 'bg-white'
  },
  {
    name: 'ingresosAnuales',
    label: 'Ingresos anuales',
    type: 'number',
    placeholder: '120.000.000',
    prefix: '$',
    colSpan: 1,
    inputClassName: 'bg-white'
  },
  {
    name: 'limiteCredito',
    label: 'Límite de crédito',
    type: 'number',
    placeholder: '5.000.000',
    prefix: '$',
    colSpan: 1,
    inputClassName: 'bg-white'
  },
  {
    name: 'creditoUsado',
    label: 'Crédito usado',
    type: 'number',
    placeholder: '1.250.000',
    prefix: '$',
    colSpan: 1,
    inputClassName: 'bg-white'
  },
  {
    name: 'motivoBloqueo',
    label: 'Motivo bloqueo',
    type: 'textarea',
    placeholder: 'Mora en pago, Cliente inactivo, Sin motivo',
    colSpan: 1,
    inputClassName: 'bg-white'
  },
  {
    name: 'respaldoRUT',
    label: 'Respaldo RUT',
    type: 'file',
    colSpan: 1,
    inputClassName: 'bg-white',
    fileConstraints: {
      maxSize: '50 MB',
      allowedFormats: ['PDF', 'JPG', 'PNG']
    }
  },
  {
    name: 'clienteExigeOC',
    label: 'Cliente exige OC para facturación',
    type: 'checkbox',
    colSpan: 1,
    checkboxLabel: 'Cliente exige OC para facturación'
  },
  {
    name: 'aprobadoPorFinanzas',
    label: 'Aprobado por finanzas',
    type: 'checkbox',
    colSpan: 1,
    checkboxLabel: 'Aprobado por finanzas'
  }
];

