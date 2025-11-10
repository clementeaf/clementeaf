import React from 'react';

/**
 * Tipo para definir un campo del formulario de segmentación
 */
export interface SegmentationFormField {
  /**
   * Nombre del campo (key)
   */
  name: string;
  /**
   * Label del campo
   */
  label: string;
  /**
   * Tipo de campo: 'text', 'select', 'number'
   */
  type?: 'text' | 'select' | 'number';
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
   * Ícono o elemento adicional a mostrar (D, N, etc.)
   */
  customElement?: React.ReactNode;
  /**
   * Opciones para select
   */
  options?: Array<{ value: string; label: string }>;
  /**
   * Prefijo para el input (ej: $)
   */
  prefix?: string;
  /**
   * Función de validación personalizada
   */
  validate?: (value: string) => string | null;
}

/**
 * Schema del formulario de segmentación
 */
export const segmentationFormSchema: SegmentationFormField[] = [
  {
    name: 'propietarioCliente',
    label: 'Propietario del cliente',
    type: 'text',
    placeholder: 'Nicolas Suazo',
    colSpan: 1,
    inputClassName: 'bg-white'
  },
  {
    name: 'tamanoEmpresa',
    label: 'Tamaño de empresa',
    type: 'select',
    placeholder: 'Selecciona un tamaño',
    colSpan: 1,
    inputClassName: 'bg-white',
    options: [
      { value: 'pequena', label: 'Pequeña' },
      { value: 'mediana', label: 'Mediana' },
      { value: 'grande', label: 'Grande' }
    ]
  },
  {
    name: 'segmento',
    label: 'Segmento',
    type: 'select',
    placeholder: 'Selecciona un segmento',
    colSpan: 1,
    inputClassName: 'bg-white',
    options: [
      { value: 'retail', label: 'Retail' },
      { value: 'industrial', label: 'Industrial' },
      { value: 'servicios', label: 'Servicios' }
    ]
  },
  {
    name: 'subsegmento',
    label: 'Subsegmento',
    type: 'select',
    placeholder: 'Selecciona un subsegmento',
    colSpan: 1,
    inputClassName: 'bg-white',
    options: [
      { value: 'sub1', label: 'Subsegmento 1' },
      { value: 'sub2', label: 'Subsegmento 2' },
      { value: 'sub3', label: 'Subsegmento 3' }
    ]
  },
  {
    name: 'empleados',
    label: 'Empleados',
    type: 'number',
    placeholder: '25',
    colSpan: 1,
    inputClassName: 'bg-white'
  },
  {
    name: 'tratos',
    label: 'Tratos',
    type: 'text',
    placeholder: '',
    prefix: '$',
    colSpan: 1,
    inputClassName: 'bg-white'
  }
];

