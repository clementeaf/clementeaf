import React from 'react';

/**
 * Tipo para definir un campo del formulario
 */
export interface FormField {
  /**
   * Nombre del campo (key)
   */
  name: string;
  /**
   * Label del campo
   */
  label: string;
  /**
   * Tipo de input
   */
  type?: 'text' | 'email' | 'tel' | 'url' | 'number';
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
   * Ícono o elemento adicional a mostrar
   */
  customElement?: React.ReactNode;
  /**
   * Función de validación personalizada
   */
  validate?: (value: string) => string | null;
}

/**
 * Schema del formulario de información del cliente
 */
export const clientInfoFormSchema: FormField[] = [
  {
    name: 'rut',
    label: 'RUT',
    type: 'text',
    placeholder: '76.543.210-9',
    colSpan: 1,
    inputClassName: 'bg-white'
  },
  {
    name: 'razonSocial',
    label: 'Razón social',
    type: 'text',
    placeholder: 'Los Andes Servicios Integrales SpA',
    colSpan: 1,
    inputClassName: 'bg-white'
  },
  {
    name: 'nombreCliente',
    label: 'Nombre del cliente',
    type: 'text',
    placeholder: 'Comercial Los Andes Ltda.',
    colSpan: 1,
    inputClassName: 'bg-white'
  },
  {
    name: 'rutCompleto',
    label: 'RUT completo',
    type: 'text',
    placeholder: '76.543.210-9',
    colSpan: 1,
    inputClassName: 'bg-white'
  },
  {
    name: 'giro',
    label: 'Giro',
    type: 'text',
    placeholder: 'Venta de artículos de aseo industrial',
    colSpan: 1,
    inputClassName: 'bg-white'
  },
  {
    name: 'sitioWeb',
    label: 'Sitio web',
    type: 'url',
    placeholder: 'www.comercialesandes.cl',
    optional: true,
    colSpan: 1,
    inputClassName: 'bg-white'
  }
];

