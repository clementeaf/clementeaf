import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CreateQuoteHeader } from './CreateQuote/CreateQuoteHeader';
import { QuoteStepper } from './CreateQuote/QuoteStepper';
import { QuoteClientForm } from './CreateQuote/QuoteClientForm';
import { QuoteConditionsForm } from './CreateQuote/QuoteConditionsForm';
import { QuoteProductsForm } from './CreateQuote/QuoteProductsForm';
import { QuoteReviewForm } from './CreateQuote/QuoteReviewForm';
import { Button } from '../../components/commons';
import { ChevronRightIcon } from '../../components/commons/icons';
import { useCreateQuote } from '../../hooks/useQuotes';
import { routes } from '../../routes';
import type { CreateQuoteDto } from '../../services/quotesService';

const STORAGE_KEY = 'createQuoteFormData';

/**
 * Página de crear orden de compra
 * @returns Componente CreateQuote
 */
export const CreateQuote = () => {
  const navigate = useNavigate();
  const createQuoteMutation = useCreateQuote();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  /**
   * Carga los datos guardados desde sessionStorage al montar el componente
   */
  useEffect(() => {
    const savedData = sessionStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error al cargar datos guardados:', error);
      }
    }
  }, []);

  /**
   * Persiste los datos en sessionStorage cada vez que formData cambia
   */
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  /**
   * Maneja el avance al siguiente paso
   */
  const handleNext = (): void => {
    if (currentStep < 4) {
      const stepData = getStepData(currentStep);
      const updatedData = { ...formData, [`step${currentStep}`]: stepData };
      setFormData(updatedData);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      setCurrentStep(currentStep + 1);
    }
  };

  /**
   * Maneja el retroceso al paso anterior
   */
  const handleBack = (): void => {
    if (currentStep > 1) {
      const stepData = getStepData(currentStep);
      const updatedData = { ...formData, [`step${currentStep}`]: stepData };
      setFormData(updatedData);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Obtiene los datos del step actual
   * @param step - Número del step
   * @returns Datos del step
   */
  const getStepData = (step: number): Record<string, unknown> => {
    switch (step) {
      case 1:
        // Si retiroEnBodega está marcado, ignorar dirección, región y comuna
        const retiroEnBodega = formData.retiroEnBodega === 'true';
        
        // Combinar región y comuna para compatibilidad con backend (solo si no es retiro en bodega)
        const regionComunaCodigo = retiroEnBodega ? '' : [
          formData.region || '',
          formData.comuna || ''
        ].filter(Boolean).join(' / ') || '';
        
        return {
          clienteNombre: formData.clienteNombre || '',
          direccionFacturacion: retiroEnBodega ? '' : (formData.direccionDespacho || ''), // Enviar direccionDespacho como direccionFacturacion para compatibilidad
          telefono: formData.telefono || '',
          regionComunaCodigo: regionComunaCodigo,
          asesorAsignado: formData.asesorAsignado || '',
          retiroEnBodega: retiroEnBodega ? 'true' : 'false',
          contactoNombre: formData.contactoNombre || '',
          contactoTelefono: formData.contactoTelefono || '',
          contactoEmail: formData.contactoEmail || '',
          countryCode: formData.countryCode || '',
          countryDialCode: formData.countryDialCode || '',
          contactoCountryCode: formData.contactoCountryCode || '',
          contactoCountryDialCode: formData.contactoCountryDialCode || ''
        };
      case 2:
        return {
          condiciones: formData.condiciones || {}
        };
      case 3:
        return {
          productos: formData.productos || []
        };
      case 4:
        return {
          revision: formData.revision || {}
        };
      default:
        return {} as Record<string, unknown>;
    }
  };

  /**
   * Maneja la actualización de datos del formulario
   * @param stepData - Datos del paso actual
   */
  const handleDataChange = (stepData: Record<string, string>): void => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  /**
   * Mapeador de pasos a sus componentes correspondientes
   */
  const stepComponents: Record<number, () => React.ReactNode> = {
    1: () => (
      <QuoteClientForm 
        onDataChange={handleDataChange}
        initialData={formData as Record<string, string>}
      />
    ),
    2: () => (
      <QuoteConditionsForm 
        onDataChange={handleDataChange}
        initialData={formData as Record<string, string>}
      />
    ),
    3: () => (
      <QuoteProductsForm 
        onDataChange={handleDataChange}
        initialData={formData as Record<string, string>}
        onBack={handleBack}
      />
    ),
    4: () => (
      <QuoteReviewForm 
        onDataChange={handleDataChange}
        initialData={formData as Record<string, string>}
        onBack={handleBack}
      />
    )
  };

  /**
   * Convierte una fecha en formato DD/MM/YYYY a ISO string
   * @param dateString - Fecha en formato DD/MM/YYYY
   * @returns Fecha en formato ISO string o null si no es válida
   */
  const convertDateToISO = (dateString: string): string | null => {
    if (!dateString) return null;
    
    // Intentar parsear formato DD/MM/YYYY
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Mes es 0-indexed
      const year = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
    
    // Si ya es un formato ISO válido, retornarlo
    const isoDate = new Date(dateString);
    if (!isNaN(isoDate.getTime())) {
      return isoDate.toISOString();
    }
    
    return null;
  };

  /**
   * Maneja el envío final del formulario
   */
  const handleSubmit = async (): Promise<void> => {
    try {
      const step1Data = getStepData(1);
      const step2Data = formData.condiciones as Record<string, unknown> || {};
      const step3Data = formData.productos as unknown[] || [];
      
      // Convertir fecha a formato ISO
      const fechaString = String(step2Data.fecha || '');
      const fechaISO = convertDateToISO(fechaString) || new Date().toISOString();
      
      // Construir el DTO completo
      const quoteData: CreateQuoteDto = {
        clienteNombre: String(step1Data.clienteNombre || ''),
        direccionFacturacion: String(step1Data.direccionFacturacion || ''),
        telefono: String(step1Data.telefono || ''),
        regionComunaCodigo: String(step1Data.regionComunaCodigo || ''),
        asesorAsignado: String(step1Data.asesorAsignado || ''),
        contactoNombre: String(step1Data.contactoNombre || ''),
        contactoTelefono: String(step1Data.contactoTelefono || ''),
        contactoEmail: String(step1Data.contactoEmail || ''),
        countryCode: String(step1Data.countryCode || ''),
        countryDialCode: String(step1Data.countryDialCode || ''),
        contactoCountryCode: String(step1Data.contactoCountryCode || ''),
        contactoCountryDialCode: String(step1Data.contactoCountryDialCode || ''),
        numeroCotizacion: String(step2Data.numeroCotizacion || ''),
        fecha: fechaISO,
        terminosPago: String(step2Data.terminosPago || ''),
        numeroReferencia: String(step2Data.numeroReferencia || ''),
        centroCosto: String(step2Data.centroCosto || ''),
        listaPrecios: String(step2Data.listaPrecios || ''),
        sinCostoEnvio: step2Data.sinCostoEnvio === 'true' || step2Data.sinCostoEnvio === true,
        productos: JSON.stringify(step3Data),
        estado: 'borrador'
      };
      
      await createQuoteMutation.mutateAsync(quoteData);
      
      toast.success('Orden de compra creada exitosamente');
      
      sessionStorage.removeItem(STORAGE_KEY);
      navigate(routes.quotes);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear la orden de compra';
      toast.error(errorMessage);
      console.error('Error al crear orden de compra:', error);
    }
  };

  /**
   * Renderiza el contenido del paso actual
   */
  const renderStepContent = (): React.ReactNode => {
    const StepComponent = stepComponents[currentStep];
    return StepComponent ? StepComponent() : null;
  };

  const isLastStep = currentStep === 4;

  return (
    <div className="w-full h-full flex flex-col p-8">
      <CreateQuoteHeader />

      <div className="flex gap-6 bg-white rounded-lg shadow-sm border border-gray-200 w-full h-full overflow-hidden">
        <QuoteStepper currentStep={currentStep} />
        <div className="w-full px-[100px] py-6 h-full flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {renderStepContent()}
          </div>
          <div className="flex justify-end gap-4 mt-6">
            {isLastStep ? (
              <>
                <Button
                  onClick={(): void => {
                    // TODO: Implementar guardar borrador
                    console.log('Guardar borrador');
                  }}
                  className="bg-[#0052C9] text-white hover:bg-[#004BB7] px-6 py-2"
                >
                  Guardar borrador
                </Button>
                <Button
                  onClick={handleSubmit}
                  rightIcon={<ChevronRightIcon color="white" />}
                  className="bg-[#004BB7] text-white hover:bg-blue-600 px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={createQuoteMutation.isPending}
                >
                  {createQuoteMutation.isPending ? 'Creando...' : 'Crear Nota de venta'}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleNext}
                rightIcon={<ChevronRightIcon color="white" />}
                className="bg-[#004BB7] text-white hover:bg-blue-600 px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

