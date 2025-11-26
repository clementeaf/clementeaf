import { useState, useEffect } from 'react';
import { Input, Checkbox } from '../../../components/commons';

/**
 * Props del componente QuoteConditionsForm
 */
interface QuoteConditionsFormProps {
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
 * Componente Formulario de condiciones (Paso 2)
 * @param props - Props del componente QuoteConditionsForm
 * @returns Componente QuoteConditionsForm
 */
export const QuoteConditionsForm = ({ onDataChange, initialData, onBack }: QuoteConditionsFormProps) => {
  const [formData, setFormData] = useState<Record<string, string>>(
    initialData || {
      numeroCotizacion: '',
      fecha: '',
      terminosPago: '',
      numeroReferencia: '',
      centroCosto: '',
      listaPrecios: '',
      sinCostoEnvio: 'false'
    }
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

  const handleCheckboxChange = (checked: boolean): void => {
    handleFieldChange('sinCostoEnvio', checked ? 'true' : 'false');
  };

  return (
    <div className="flex-1 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6">Condiciones de la cotización</h2>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Input
            id="numeroCotizacion"
            label="N° de cotización"
            type="text"
            value={formData.numeroCotizacion || ''}
            onChange={(e): void => handleFieldChange('numeroCotizacion', e.target.value)}
            placeholder="030000029484892104"
            inputClassName="bg-white"
            error={errors.numeroCotizacion || undefined}
          />
        </div>

        <div>
          <Input
            id="fecha"
            label="Fecha"
            type="text"
            value={formData.fecha || ''}
            onChange={(e): void => handleFieldChange('fecha', e.target.value)}
            placeholder="19/11/2025"
            inputClassName="bg-white"
            error={errors.fecha || undefined}
          />
        </div>

        <div>
          <Input
            id="terminosPago"
            label="Términos de pago"
            type="text"
            value={formData.terminosPago || ''}
            onChange={(e): void => handleFieldChange('terminosPago', e.target.value)}
            placeholder="Contado, 30 días, Transferencia"
            inputClassName="bg-white"
            error={errors.terminosPago || undefined}
          />
        </div>

        <div>
          <Input
            id="numeroReferencia"
            label="N° de referencia"
            type="text"
            value={formData.numeroReferencia || ''}
            onChange={(e): void => handleFieldChange('numeroReferencia', e.target.value)}
            placeholder="guía, OC o referencia interna"
            inputClassName="bg-white"
            error={errors.numeroReferencia || undefined}
          />
        </div>

        <div>
          <Input
            id="centroCosto"
            label="Centro de costo"
            type="text"
            value={formData.centroCosto || ''}
            onChange={(e): void => handleFieldChange('centroCosto', e.target.value)}
            placeholder="CC-245 Logística / CC-112 Operaciones"
            inputClassName="bg-white"
            error={errors.centroCosto || undefined}
          />
        </div>

        <div>
          <Input
            id="listaPrecios"
            label="Lista de precios"
            type="text"
            value={formData.listaPrecios || ''}
            onChange={(e): void => handleFieldChange('listaPrecios', e.target.value)}
            placeholder="Mayorista"
            inputClassName="bg-white"
            error={errors.listaPrecios || undefined}
          />
        </div>

        <div>
          <Checkbox
            id="sinCostoEnvio"
            label="Sin costo de envío"
            checked={formData.sinCostoEnvio === 'true'}
            onChange={(e): void => handleCheckboxChange(e.target.checked)}
            containerClassName="mt-6"
          />
        </div>
      </div>
    </div>
  );
};

