/**
 * Tipo para definir un campo del formulario de contacto
 */
export interface ContactFormField {
  /**
   * Nombre del campo (key)
   */
  name: string;
  /**
   * Label del campo
   */
  label: string;
  /**
   * Tipo de campo: 'text', 'email', 'tel', 'phone'
   */
  type?: 'text' | 'email' | 'tel' | 'phone';
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
   * Función de validación personalizada
   */
  validate?: (value: string) => string | null;
}

/**
 * Schema del formulario de contacto
 */
export const contactFormSchema: ContactFormField[] = [
  {
    name: 'nombre',
    label: 'Nombre',
    type: 'text',
    placeholder: 'Maria Gonzalález',
    colSpan: 1,
    inputClassName: 'bg-white'
  },
  {
    name: 'cargo',
    label: 'Cargo',
    type: 'text',
    placeholder: 'Encargada de compras',
    colSpan: 1,
    inputClassName: 'bg-white'
  },
  {
    name: 'correoElectronico',
    label: 'Correo electrónico',
    type: 'email',
    placeholder: 'maria.gonzález@empresa.cl',
    colSpan: 1,
    inputClassName: 'bg-white'
  },
  {
    name: 'telefono',
    label: 'Teléfono',
    type: 'phone',
    placeholder: '000000000',
    colSpan: 1,
    inputClassName: 'bg-white'
  }
];

