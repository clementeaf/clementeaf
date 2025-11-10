/**
 * Tipo para definir un campo del formulario de dirección
 */
export interface AddressFormField {
  /**
   * Nombre del campo (key)
   */
  name: string;
  /**
   * Label del campo
   */
  label: string;
  /**
   * Tipo de campo: 'text', 'select'
   */
  type?: 'text' | 'select';
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
   * Sección a la que pertenece: 'facturacion' o 'despacho'
   */
  section?: 'facturacion' | 'despacho';
  /**
   * Función de validación personalizada
   */
  validate?: (value: string) => string | null;
}

/**
 * Schema del formulario de dirección de facturación
 */
export const billingAddressSchema: AddressFormField[] = [
  {
    name: 'direccionFacturacion',
    label: 'Dirección',
    type: 'text',
    placeholder: 'Av. Las Industrias 2450, Bodega 4',
    colSpan: 1,
    inputClassName: 'bg-white',
    section: 'facturacion'
  },
  {
    name: 'regionFacturacion',
    label: 'Región',
    type: 'select',
    placeholder: 'Selecciona una región',
    colSpan: 1,
    inputClassName: 'bg-white',
    section: 'facturacion',
    options: [
      { value: 'arica', label: 'Arica y Parinacota' },
      { value: 'tarapaca', label: 'Tarapacá' },
      { value: 'antofagasta', label: 'Antofagasta' },
      { value: 'atacama', label: 'Atacama' },
      { value: 'coquimbo', label: 'Coquimbo' },
      { value: 'valparaiso', label: 'Valparaíso' },
      { value: 'metropolitana', label: 'Región Metropolitana' },
      { value: 'ohiggins', label: "O'Higgins" },
      { value: 'maule', label: 'Maule' },
      { value: 'nuble', label: 'Ñuble' },
      { value: 'biobio', label: 'Biobío' },
      { value: 'araucania', label: 'La Araucanía' },
      { value: 'rios', label: 'Los Ríos' },
      { value: 'lagos', label: 'Los Lagos' },
      { value: 'aysen', label: 'Aysén' },
      { value: 'magallanes', label: 'Magallanes' }
    ]
  },
  {
    name: 'comunaFacturacion',
    label: 'Comuna',
    type: 'select',
    placeholder: 'Selecciona una comuna',
    colSpan: 1,
    inputClassName: 'bg-white',
    section: 'facturacion',
    options: []
  },
  {
    name: 'codigoPostalFacturacion',
    label: 'Código postal',
    type: 'text',
    placeholder: '9492920048',
    colSpan: 1,
    inputClassName: 'bg-white',
    section: 'facturacion'
  }
];

/**
 * Schema del formulario de dirección de despacho
 */
export const shippingAddressSchema: AddressFormField[] = [
  {
    name: 'direccionDespacho',
    label: 'Dirección',
    type: 'text',
    placeholder: 'Av. Las Industrias 2450, Bodega 4',
    colSpan: 1,
    inputClassName: 'bg-white',
    section: 'despacho'
  },
  {
    name: 'regionDespacho',
    label: 'Región',
    type: 'select',
    placeholder: 'Selecciona una región',
    colSpan: 1,
    inputClassName: 'bg-white',
    section: 'despacho',
    options: [
      { value: 'arica', label: 'Arica y Parinacota' },
      { value: 'tarapaca', label: 'Tarapacá' },
      { value: 'antofagasta', label: 'Antofagasta' },
      { value: 'atacama', label: 'Atacama' },
      { value: 'coquimbo', label: 'Coquimbo' },
      { value: 'valparaiso', label: 'Valparaíso' },
      { value: 'metropolitana', label: 'Región Metropolitana' },
      { value: 'ohiggins', label: "O'Higgins" },
      { value: 'maule', label: 'Maule' },
      { value: 'nuble', label: 'Ñuble' },
      { value: 'biobio', label: 'Biobío' },
      { value: 'araucania', label: 'La Araucanía' },
      { value: 'rios', label: 'Los Ríos' },
      { value: 'lagos', label: 'Los Lagos' },
      { value: 'aysen', label: 'Aysén' },
      { value: 'magallanes', label: 'Magallanes' }
    ]
  },
  {
    name: 'comunaDespacho',
    label: 'Comuna',
    type: 'select',
    placeholder: 'Selecciona una comuna',
    colSpan: 1,
    inputClassName: 'bg-white',
    section: 'despacho',
    options: []
  },
  {
    name: 'codigoPostalDespacho',
    label: 'Código postal',
    type: 'text',
    placeholder: '9492920048',
    colSpan: 1,
    inputClassName: 'bg-white',
    section: 'despacho'
  }
];

