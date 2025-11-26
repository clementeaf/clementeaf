import { useState, useEffect } from 'react';
import { Input } from '../../../components/commons';

/**
 * Props del componente QuoteProductsForm
 */
interface QuoteProductsFormProps {
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
 * Componente Formulario de productos (Paso 3)
 * @param props - Props del componente QuoteProductsForm
 * @returns Componente QuoteProductsForm
 */
export const QuoteProductsForm = ({ onDataChange, initialData, onBack }: QuoteProductsFormProps) => {
  const [formData, setFormData] = useState<Record<string, string>>(
    initialData || {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleFieldChange = (fieldName: string, value: string): void => {
    const newData = { ...formData, [fieldName]: value };
    setFormData(newData);
    
    if (onDataChange) {
      onDataChange(newData);
    }

    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  return (
    <div className="flex-1 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6">Productos</h2>
      <div className="space-y-6">
        <p className="text-gray-600">Formulario de productos (en desarrollo)</p>
      </div>
    </div>
  );
};

