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
import { routes } from '../../routes';

const STORAGE_KEY = 'createQuoteFormData';

/**
 * Página de crear cotización
 * @returns Componente CreateQuote
 */
export const CreateQuote = () => {
  const navigate = useNavigate();
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
        return {
          clienteNombre: formData.clienteNombre || '',
          direccionFacturacion: formData.direccionFacturacion || '',
          telefono: formData.telefono || '',
          regionComunaCodigo: formData.regionComunaCodigo || '',
          asesorAsignado: formData.asesorAsignado || '',
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
        onBack={handleBack}
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
   * Maneja el envío final del formulario
   */
  const handleSubmit = async (): Promise<void> => {
    try {
      const quoteData = getStepData(1);
      
      // TODO: Implementar creación de cotización
      console.log('Datos de cotización:', quoteData);
      
      toast.success('Cotización creada exitosamente');
      
      sessionStorage.removeItem(STORAGE_KEY);
      navigate(routes.quotes);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear la cotización';
      toast.error(errorMessage);
      console.error('Error al crear cotización:', error);
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

      <div className="flex gap-6 bg-white rounded-lg shadow-sm border border-gray-200 w-full h-full">
        <QuoteStepper currentStep={currentStep} />
        <div className="w-full px-[100px] py-6 h-full flex flex-col">
          <div className="flex-1">
            {renderStepContent()}
          </div>
          <div className="flex justify-end mt-6">
            <Button
              onClick={isLastStep ? handleSubmit : handleNext}
              rightIcon={!isLastStep ? <ChevronRightIcon color="white" /> : undefined}
              className="bg-[#004BB7] text-white hover:bg-blue-600 px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLastStep 
                ? 'Crear Cotización'
                : 'Siguiente'
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

