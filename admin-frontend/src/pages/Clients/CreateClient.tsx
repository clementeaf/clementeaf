import { useState, useEffect } from 'react';
import { CreateClientHeader } from './CreateClient/CreateClientHeader';
import { ClientStepper } from './CreateClient/ClientStepper';
import { ClientInfoForm } from './CreateClient/ClientInfoForm';
import { SegmentationForm } from './CreateClient/SegmentationForm';
import { BillingForm } from './CreateClient/BillingForm';
import { Button } from '../../components/commons';
import { ChevronRightIcon } from '../../components/commons/icons';

const STORAGE_KEY = 'createClientFormData';

/**
 * Página de crear cliente
 * @returns Componente CreateClient
 */
export const CreateClient = () => {
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
    if (currentStep < 5) {
      // Obtener los datos del step actual
      const stepData = getStepData(currentStep);
      
      // Mostrar alert con los datos del step actual
      alert(`Datos del Paso ${currentStep}:\n\n${JSON.stringify(stepData, null, 2)}`);
      
      // Persistir datos antes de avanzar
      const updatedData = { ...formData, [`step${currentStep}`]: stepData };
      setFormData(updatedData);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      
      // Avanzar al siguiente paso
      setCurrentStep(currentStep + 1);
    }
  };

  /**
   * Maneja el retroceso al paso anterior
   */
  const handleBack = (): void => {
    if (currentStep > 1) {
      // Obtener los datos del step actual antes de retroceder
      const stepData = getStepData(currentStep);
      
      // Persistir datos antes de retroceder
      const updatedData = { ...formData, [`step${currentStep}`]: stepData };
      setFormData(updatedData);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      
      // Retroceder al paso anterior
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
        // Datos del paso 1 (Información del cliente)
        return {
          rut: formData.rut || '',
          razonSocial: formData.razonSocial || '',
          nombreCliente: formData.nombreCliente || '',
          rutCompleto: formData.rutCompleto || '',
          giro: formData.giro || '',
          sitioWeb: formData.sitioWeb || ''
        };
      case 2:
        // Datos del paso 2 (Segmentación)
        return {
          propietarioCliente: formData.propietarioCliente || '',
          tamanoEmpresa: formData.tamanoEmpresa || '',
          segmento: formData.segmento || '',
          subsegmento: formData.subsegmento || '',
          empleados: formData.empleados || '',
          tratos: formData.tratos || ''
        };
      case 3:
        // Datos del paso 3 (Facturación)
        return {
          documentoPorDefecto: formData.documentoPorDefecto || '',
          formaPago: formData.formaPago || '',
          listaPrecios: formData.listaPrecios || '',
          ingresosAnuales: formData.ingresosAnuales || '',
          limiteCredito: formData.limiteCredito || '',
          creditoUsado: formData.creditoUsado || '',
          motivoBloqueo: formData.motivoBloqueo || '',
          respaldoRUT: formData.respaldoRUT || '',
          clienteExigeOC: formData.clienteExigeOC || '',
          aprobadoPorFinanzas: formData.aprobadoPorFinanzas || ''
        };
      case 4:
        return formData.step4 || {};
      case 5:
        return formData.step5 || {};
      default:
        return {};
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
      <ClientInfoForm 
        onDataChange={handleDataChange}
        initialData={formData as Record<string, string>}
      />
    ),
    2: () => (
      <SegmentationForm 
        onDataChange={handleDataChange}
        initialData={formData as Record<string, string>}
        onBack={handleBack}
      />
    ),
    3: () => (
      <BillingForm 
        onDataChange={handleDataChange}
        initialData={formData as Record<string, string>}
        onBack={handleBack}
      />
    ),
    4: () => <div>Paso 4: Contacto (TODO)</div>,
    5: () => <div>Paso 5: Dirección (TODO)</div>
  };

  /**
   * Maneja el envío final del formulario
   */
  const handleSubmit = async (): Promise<void> => {
    try {
      // Obtener los datos del último step
      const stepData = getStepData(5);
      
      // Mostrar alert con todos los datos antes de enviar
      alert(`Datos completos del cliente:\n\n${JSON.stringify(formData, null, 2)}`);
      
      // TODO: Implementar envío de datos al backend
      // Aquí se enviará toda la data colectada de todos los pasos
      console.log('Datos del cliente:', formData);
      
      // Limpiar datos guardados después de enviar
      sessionStorage.removeItem(STORAGE_KEY);
      
      // Navegar de vuelta a la tabla de clientes después de enviar
      // navigate(routes.clients);
    } catch (error) {
      console.error('Error al crear cliente:', error);
    }
  };

  /**
   * Renderiza el contenido del paso actual
   */
  const renderStepContent = (): React.ReactNode => {
    const StepComponent = stepComponents[currentStep];
    return StepComponent ? StepComponent() : null;
  };

  const isLastStep = currentStep === 5;

  return (
    <div className="w-full h-full flex flex-col p-8">
      <CreateClientHeader />

      <div className="flex gap-6 bg-white rounded-lg shadow-sm border border-gray-200 w-full h-full">
        <ClientStepper currentStep={currentStep} />
        <div className="w-full px-[100px] py-6 h-full flex flex-col">
          <div className="flex-1">
            {renderStepContent()}
          </div>
          <div className="flex justify-end mt-6">
            <Button
              onClick={isLastStep ? handleSubmit : handleNext}
              rightIcon={!isLastStep ? <ChevronRightIcon color="white" /> : undefined}
              className="bg-[#004BB7] text-white hover:bg-blue-600 px-6 py-2"
            >
              {isLastStep ? 'Enviar' : 'Siguiente'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

