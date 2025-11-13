import { useState } from 'react';
import { Button, Input, Select } from '../components/commons';
import { ProductSearch, type Product } from './SalesOrder/ProductSearch';

/**
 * Página de orden de ventas
 * @returns Componente SalesOrder
 */
export const SalesOrder = () => {
  const [formData, setFormData] = useState<Record<string, string>>({
    cliente: '',
    fecha: '',
    estado: '',
    vendedor: '',
    observaciones: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  /**
   * Maneja el cambio de un campo del formulario
   * @param fieldName - Nombre del campo
   * @param value - Nuevo valor
   */
  const handleFieldChange = (fieldName: string, value: string): void => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));

    // Limpiar error del campo cuando se modifica
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  /**
   * Valida el formulario antes de enviar
   * @returns true si el formulario es válido
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cliente.trim()) {
      newErrors.cliente = 'El cliente es requerido';
    }

    if (!formData.fecha.trim()) {
      newErrors.fecha = 'La fecha es requerida';
    }

    if (!formData.estado.trim()) {
      newErrors.estado = 'El estado es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = (): void => {
    if (validateForm()) {
      console.log('Formulario enviado:', formData);
      // TODO: Implementar lógica de envío
    }
  };

  /**
   * Maneja la selección de un producto
   */
  const handleSelectProduct = (product: Product): void => {
    setSelectedProduct(product);
  };

  /**
   * Maneja la cancelación del formulario
   */
  const handleCancel = (): void => {
    setFormData({
      cliente: '',
      fecha: '',
      estado: '',
      vendedor: '',
      observaciones: ''
    });
    setErrors({});
    setSelectedProduct(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Orden de ventas</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Input
          id="cliente"
          label="Cliente"
          type="text"
          value={formData.cliente}
          onChange={(e): void => handleFieldChange('cliente', e.target.value)}
          placeholder="Seleccione o ingrese cliente"
          error={errors.cliente}
          required
        />

        <Input
          id="fecha"
          label="Fecha"
          type="date"
          value={formData.fecha}
          onChange={(e): void => handleFieldChange('fecha', e.target.value)}
          error={errors.fecha}
          required
        />

        <Select
          id="estado"
          label="Estado"
          value={formData.estado}
          onChange={(e): void => handleFieldChange('estado', e.target.value)}
          options={[
            { value: '', label: 'Seleccione estado' },
            { value: 'pendiente', label: 'Pendiente' },
            { value: 'en_proceso', label: 'En proceso' },
            { value: 'completada', label: 'Completada' },
            { value: 'cancelada', label: 'Cancelada' }
          ]}
          error={errors.estado}
          required
        />

        <Input
          id="vendedor"
          label="Vendedor"
          type="text"
          value={formData.vendedor}
          onChange={(e): void => handleFieldChange('vendedor', e.target.value)}
          placeholder="Nombre del vendedor"
        />
      </div>

      <div className="mb-6">
        <ProductSearch
          selectedProduct={selectedProduct}
          onSelectProduct={handleSelectProduct}
          label="Producto"
          required
        />
      </div>

      <div className="mb-6">
        <Input
          id="observaciones"
          label="Observaciones"
          type="text"
          value={formData.observaciones}
          onChange={(e): void => handleFieldChange('observaciones', e.target.value)}
          placeholder="Notas adicionales sobre la orden"
          containerClassName="col-span-2"
        />
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
        <Button
          className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          onClick={handleCancel}
        >
          Cancelar
        </Button>
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={handleSubmit}
        >
          Guardar
        </Button>
      </div>
    </div>
  );
};
