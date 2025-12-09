import { useState, useEffect, useMemo } from 'react';
import { Input, Checkbox } from '../../../components/commons';
import { quotesService } from '../../../services/quotesService';
import { logger } from '../../../utils/logger';

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
}

/**
 * Componente Formulario de condiciones (Paso 2)
 * @param props - Props del componente QuoteConditionsForm
 * @returns Componente QuoteConditionsForm
 */
export const QuoteConditionsForm = ({ onDataChange, initialData }: QuoteConditionsFormProps) => {
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
  const [isLoadingNumber, setIsLoadingNumber] = useState(false);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  /**
   * Obtiene la fecha actual en formato DD/MM/YYYY
   */
  const getCurrentDate = (): string => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

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

  /**
   * Sincroniza el estado local con initialData cuando cambia
   * Usa JSON.stringify para evitar loops infinitos
   */
  const initialDataString = useMemo(() => JSON.stringify(initialData || {}), [initialData]);
  
  useEffect(() => {
    if (!initialData || Object.keys(initialData).length === 0) {
      return;
    }

    setFormData(prev => {
      // Comparar valores específicos en lugar de toda la referencia
      const hasChanges = Object.keys(initialData).some(
        key => prev[key] !== initialData[key]
      );
      
      if (!hasChanges) {
        return prev;
      }
      
      return { ...prev, ...initialData };
    });
  }, [initialDataString, initialData]);

  /**
   * Carga datos iniciales automáticamente cuando se monta el componente
   */
  useEffect(() => {
    if (hasLoadedInitialData) return;

    let isMounted = true;

    const loadInitialData = async (): Promise<void> => {
      const updates: Record<string, string> = {};

      // Cargar número de orden si no existe
      if (!formData.numeroCotizacion || formData.numeroCotizacion === '') {
        setIsLoadingNumber(true);
        try {
          const nextNumber = await quotesService.getNextQuoteNumber();
          if (isMounted) {
            updates.numeroCotizacion = nextNumber;
          }
        } catch (error) {
          logger.error('Error al obtener número de orden', error);
        } finally {
          if (isMounted) {
            setIsLoadingNumber(false);
          }
        }
      }

      // Establecer fecha actual si no hay fecha
      if (!formData.fecha || formData.fecha === '') {
        updates.fecha = getCurrentDate();
      }

      // Establecer términos de pago del cliente si está disponible
      if (initialData?.clienteFormaPago && (!formData.terminosPago || formData.terminosPago === '')) {
        updates.terminosPago = initialData.clienteFormaPago;
      }

      // Establecer lista de precios del cliente si está disponible
      if (initialData?.clienteListaPrecios && (!formData.listaPrecios || formData.listaPrecios === '')) {
        updates.listaPrecios = initialData.clienteListaPrecios;
      }

      // Aplicar todas las actualizaciones de una vez
      if (isMounted && Object.keys(updates).length > 0) {
        setFormData(prev => {
          const newData = { ...prev, ...updates };
          // Usar setTimeout para evitar el warning de React sobre actualizar durante renderizado
          setTimeout(() => {
            if (onDataChange) {
              onDataChange(newData);
            }
          }, 0);
          return newData;
        });
      }

      if (isMounted) {
        setHasLoadedInitialData(true);
      }
    };

    // Ejecutar después del primer render
    const timeoutId = setTimeout(() => {
      loadInitialData();
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Justificación: Este efecto debe ejecutarse solo una vez al montar el componente.
    // loadInitialData es una función interna que usa formData e initialData, pero incluir
    // estas dependencias causaría que se ejecute múltiples veces innecesariamente.
    // hasLoadedInitialData previene ejecuciones múltiples.
    // onDataChange está envuelto en useCallback en el componente padre (CreateQuote.tsx).
  }, [hasLoadedInitialData, formData.fecha, formData.listaPrecios, formData.numeroCotizacion, formData.terminosPago, initialData?.clienteFormaPago, initialData?.clienteListaPrecios, onDataChange]);

  const handleCheckboxChange = (checked: boolean): void => {
    handleFieldChange('sinCostoEnvio', checked ? 'true' : 'false');
  };

  return (
    <div className="flex-1 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6">Condiciones de la orden de compra</h2>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Input
            id="numeroCotizacion"
            label="N° de orden de compra"
            type="text"
            value={formData.numeroCotizacion || ''}
            onChange={(e): void => handleFieldChange('numeroCotizacion', e.target.value)}
            placeholder={isLoadingNumber ? "Cargando..." : "030000029484892104"}
            inputClassName="bg-white"
            disabled={isLoadingNumber}
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
            placeholder={getCurrentDate()}
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

