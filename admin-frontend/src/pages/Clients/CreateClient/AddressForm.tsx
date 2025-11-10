import { useState, useEffect } from 'react';
import { Input, Select } from '../../../components/commons';
import { getCommunesByRegion } from '../../../components/commons/chileRegions';
import { billingAddressSchema, shippingAddressSchema, type AddressFormField } from './AddressForm.schema';

/**
 * Props del componente AddressForm
 */
interface AddressFormProps {
  /**
   * Función para actualizar los datos del formulario
   */
  onDataChange?: (data: Record<string, string>) => void;
  /**
   * Datos iniciales del formulario
   */
  initialData?: Record<string, string>;
  /**
   * Función para volver al paso anterior
   */
  onBack?: () => void;
}

/**
 * Componente Formulario de dirección (Paso 5)
 * @param props - Props del componente AddressForm
 * @returns Componente AddressForm
 */
export const AddressForm = ({ onDataChange, initialData, onBack }: AddressFormProps) => {
  const [formData, setFormData] = useState<Record<string, string>>(
    initialData || {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [useSameAddress, setUseSameAddress] = useState<boolean>(false);

  /**
   * Sincroniza el estado local con initialData cuando cambia
   */
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => {
        const hasChanges = Object.keys(initialData).some(
          key => prev[key] !== initialData[key]
        );
        return hasChanges ? { ...prev, ...initialData } : prev;
      });
    }
  }, [initialData]);

  /**
   * Maneja el cambio de un campo
   * @param fieldName - Nombre del campo
   * @param value - Nuevo valor
   */
  const handleFieldChange = (fieldName: string, value: string): void => {
    const newData = { ...formData, [fieldName]: value };
    
    // Si cambia la región de facturación, limpiar la comuna de facturación
    if (fieldName === 'regionFacturacion') {
      newData.comunaFacturacion = '';
      
      // Si está marcado "usar la misma dirección", actualizar también la región de despacho
      if (useSameAddress) {
        newData.regionDespacho = value;
        newData.comunaDespacho = '';
      }
    }
    
    // Si cambia la región de despacho, limpiar la comuna de despacho
    if (fieldName === 'regionDespacho') {
      newData.comunaDespacho = '';
    }
    
    // Si cambia cualquier campo de facturación y está marcado "usar la misma dirección", copiar a despacho
    if (useSameAddress && (
        fieldName === 'direccionFacturacion' || 
        fieldName === 'regionFacturacion' || 
        fieldName === 'comunaFacturacion' || 
        fieldName === 'codigoPostalFacturacion'
      )) {
      const despachoFieldName = fieldName.replace('Facturacion', 'Despacho');
      newData[despachoFieldName] = value;
    }
    
    setFormData(newData);
    
    if (onDataChange) {
      onDataChange(newData);
    }

    // Validar campo si tiene función de validación
    const allFields = [...billingAddressSchema, ...shippingAddressSchema];
    const field = allFields.find(f => f.name === fieldName);
    if (field?.validate) {
      const error = field.validate(value);
      setErrors(prev => ({ ...prev, [fieldName]: error || '' }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  /**
   * Maneja el cambio del checkbox "Usar la misma dirección"
   */
  const handleUseSameAddressChange = (checked: boolean): void => {
    setUseSameAddress(checked);
    
    if (checked) {
      // Copiar datos de facturación a despacho
      const newData = {
        ...formData,
        direccionDespacho: formData.direccionFacturacion || '',
        regionDespacho: formData.regionFacturacion || '',
        comunaDespacho: formData.comunaFacturacion || '',
        codigoPostalDespacho: formData.codigoPostalFacturacion || ''
      };
      setFormData(newData);
      
      if (onDataChange) {
        onDataChange(newData);
      }
    }
  };

  /**
   * Obtiene las opciones para un campo select
   * @param field - Campo del formulario
   * @returns Opciones para el select
   */
  const getSelectOptions = (field: AddressFormField): Array<{ value: string; label: string }> => {
    // Si es el campo de comuna, obtener las comunas según la región seleccionada
    if (field.name === 'comunaFacturacion') {
      const regionValue = formData.regionFacturacion || '';
      return getCommunesByRegion(regionValue);
    }
    
    if (field.name === 'comunaDespacho') {
      const regionValue = formData.regionDespacho || '';
      return getCommunesByRegion(regionValue);
    }
    
    // Para otros campos select, usar las opciones del schema
    return field.options || [];
  };

  /**
   * Obtiene el placeholder para un campo select
   * @param field - Campo del formulario
   * @returns Placeholder para el select
   */
  const getSelectPlaceholder = (field: AddressFormField): string => {
    // Si es el campo de comuna y no hay región seleccionada, mostrar mensaje especial
    if (field.name === 'comunaFacturacion' && !formData.regionFacturacion) {
      return 'Selecciona una región para seleccionar comuna';
    }
    
    if (field.name === 'comunaDespacho' && !formData.regionDespacho) {
      return 'Selecciona una región para seleccionar comuna';
    }
    
    return field.placeholder || 'Selecciona una opción';
  };

  /**
   * Verifica si un campo select está deshabilitado
   * @param field - Campo del formulario
   * @returns true si el campo está deshabilitado
   */
  const isSelectDisabled = (field: AddressFormField): boolean => {
    // Si es el campo de comuna y no hay región seleccionada, deshabilitar
    if (field.name === 'comunaFacturacion' && !formData.regionFacturacion) {
      return true;
    }
    
    if (field.name === 'comunaDespacho' && !formData.regionDespacho) {
      return true;
    }
    
    // Si está marcado "usar la misma dirección" y es un campo de despacho, deshabilitar
    if (useSameAddress && field.section === 'despacho') {
      return true;
    }
    
    return false;
  };

  /**
   * Renderiza un campo del formulario
   * @param field - Configuración del campo
   * @returns Elemento del campo
   */
  const renderField = (field: AddressFormField): React.ReactNode => {
    const label = field.optional ? `${field.label} (opcional)` : field.label;
    const colSpanClass = field.colSpan === 2 ? 'col-span-2' : 'col-span-1';

    if (field.type === 'select') {
      const options = getSelectOptions(field);
      const placeholder = getSelectPlaceholder(field);
      const disabled = isSelectDisabled(field);
      
      return (
        <div key={field.name} className={`${colSpanClass} ${field.containerClassName || ''}`}>
          <Select
            id={field.name}
            label={label}
            value={formData[field.name] || ''}
            onChange={(e): void => handleFieldChange(field.name, e.target.value)}
            placeholder={placeholder}
            options={options}
            selectClassName={field.inputClassName}
            error={errors[field.name] || undefined}
            disabled={disabled}
          />
        </div>
      );
    }

    // Renderizar input normal usando Input component para consistencia
    return (
      <div key={field.name} className={`${colSpanClass} ${field.containerClassName || ''}`}>
        <Input
          id={field.name}
          label={label}
          type={field.type || 'text'}
          value={formData[field.name] || ''}
          onChange={(e): void => handleFieldChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          inputClassName={field.inputClassName}
          error={errors[field.name] || undefined}
          disabled={useSameAddress && field.section === 'despacho'}
        />
      </div>
    );
  };

  return (
    <div className="flex-1 p-6">
      {onBack && (
        <button
          onClick={onBack}
          className="text-[#004BB7] hover:text-blue-600 text-sm font-medium mb-4 flex items-center gap-1"
        >
          <span>←</span>
          <span>Volver atrás</span>
        </button>
      )}
      <h2 className="text-lg font-bold text-gray-800 mb-6">Dirección</h2>
      
      {/* Dirección de facturación */}
      <div className="mb-8">
        <h3 className="text-base font-semibold text-gray-700 mb-4">Dirección de facturación</h3>
        <div className="grid grid-cols-2 gap-4">
          {billingAddressSchema.map(renderField)}
        </div>
      </div>

      {/* Checkbox para usar la misma dirección */}
      <div className="mb-8">
        <div className="flex items-center">
          <input
            id="useSameAddress"
            type="checkbox"
            checked={useSameAddress}
            onChange={(e): void => handleUseSameAddressChange(e.target.checked)}
            className="w-4 h-4 text-[#004BB7] border-gray-300 rounded focus:ring-[#004BB7] focus:ring-2"
          />
          <label htmlFor="useSameAddress" className="ml-2 text-sm font-medium text-gray-700">
            Usar la misma dirección para despacho
          </label>
        </div>
      </div>

      {/* Dirección de despacho */}
      <div>
        <h3 className="text-base font-semibold text-gray-700 mb-4">Dirección de despacho</h3>
        <div className="grid grid-cols-2 gap-4">
          {shippingAddressSchema.map(renderField)}
        </div>
      </div>
    </div>
  );
};

