import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CreateClientHeader } from './CreateClient/CreateClientHeader';
import { ClientStepper } from './CreateClient/ClientStepper';
import { ClientInfoForm } from './CreateClient/ClientInfoForm';
import { SegmentationForm } from './CreateClient/SegmentationForm';
import { BillingForm } from './CreateClient/BillingForm';
import { ContactForm } from './CreateClient/ContactForm';
import { AddressForm } from './CreateClient/AddressForm';
import { Button } from '../../components/commons';
import { ChevronRightIcon } from '../../components/commons/icons';
import { useCreateClient } from '../../hooks/useClients';
import { routes } from '../../routes';
import type { CreateClientDto } from '../../services/clientsService';

const STORAGE_KEY = 'createClientFormData';

/**
 * Página de crear cliente
 * @returns Componente CreateClient
 */
export const CreateClient = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const createClientMutation = useCreateClient();

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
        // Datos del paso 4 (Contacto)
        return {
          nombre: formData.nombre || '',
          cargo: formData.cargo || '',
          correoElectronico: formData.correoElectronico || '',
          telefono: formData.telefono || '',
          countryCode: formData.countryCode || '',
          countryDialCode: formData.countryDialCode || ''
        };
      case 5:
        // Datos del paso 5 (Dirección)
        return {
          direccionFacturacion: formData.direccionFacturacion || '',
          regionFacturacion: formData.regionFacturacion || '',
          comunaFacturacion: formData.comunaFacturacion || '',
          codigoPostalFacturacion: formData.codigoPostalFacturacion || '',
          direccionDespacho: formData.direccionDespacho || '',
          regionDespacho: formData.regionDespacho || '',
          comunaDespacho: formData.comunaDespacho || '',
          codigoPostalDespacho: formData.codigoPostalDespacho || '',
          usarMismaDireccion: formData.useSameAddress || formData.usarMismaDireccion || false
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
    4: () => (
      <ContactForm 
        onDataChange={handleDataChange}
        initialData={formData as Record<string, string>}
        onBack={handleBack}
      />
    ),
    5: () => (
      <AddressForm 
        onDataChange={handleDataChange}
        initialData={formData as Record<string, string>}
        onBack={handleBack}
      />
    )
  };

  /**
   * Mapea los datos del formulario al DTO de creación de cliente
   * @returns DTO para crear el cliente
   */
  const mapFormDataToDto = (): CreateClientDto => {
    // Obtener todos los datos de todos los pasos
    const step1Data = getStepData(1);
    const step2Data = getStepData(2);
    const step3Data = getStepData(3);
    const step4Data = getStepData(4);
    const step5Data = getStepData(5);

    return {
      // Paso 1: Información del Cliente
      rut: String(step1Data.rut || ''),
      razonSocial: String(step1Data.razonSocial || ''),
      nombreCliente: String(step1Data.nombreCliente || ''),
      rutCompleto: String(step1Data.rutCompleto || ''),
      giro: String(step1Data.giro || ''),
      sitioWeb: step1Data.sitioWeb ? String(step1Data.sitioWeb) : undefined,

      // Paso 2: Segmentación
      propietarioCliente: step2Data.propietarioCliente ? String(step2Data.propietarioCliente) : undefined,
      tamanoEmpresa: step2Data.tamanoEmpresa ? String(step2Data.tamanoEmpresa) : undefined,
      segmento: step2Data.segmento ? String(step2Data.segmento) : undefined,
      subsegmento: step2Data.subsegmento ? String(step2Data.subsegmento) : undefined,
      empleados: step2Data.empleados ? Number(step2Data.empleados) : undefined,
      tratos: step2Data.tratos ? String(step2Data.tratos) : undefined,

      // Paso 3: Facturación
      documentoPorDefecto: step3Data.documentoPorDefecto ? String(step3Data.documentoPorDefecto) : undefined,
      formaPago: step3Data.formaPago ? String(step3Data.formaPago) : undefined,
      listaPrecios: step3Data.listaPrecios ? String(step3Data.listaPrecios) : undefined,
      ingresosAnuales: step3Data.ingresosAnuales ? Number(step3Data.ingresosAnuales) : undefined,
      limiteCredito: step3Data.limiteCredito ? Number(step3Data.limiteCredito) : undefined,
      creditoUsado: step3Data.creditoUsado ? Number(step3Data.creditoUsado) : undefined,
      motivoBloqueo: step3Data.motivoBloqueo ? String(step3Data.motivoBloqueo) : undefined,
      respaldoRUT: step3Data.respaldoRUT ? String(step3Data.respaldoRUT) : undefined,
      clienteExigeOC: step3Data.clienteExigeOC === 'true' || step3Data.clienteExigeOC === true,
      aprobadoPorFinanzas: step3Data.aprobadoPorFinanzas === 'true' || step3Data.aprobadoPorFinanzas === true,

      // Paso 4: Contacto
      contactoNombre: step4Data.nombre ? String(step4Data.nombre) : undefined,
      contactoCargo: step4Data.cargo ? String(step4Data.cargo) : undefined,
      contactoCorreoElectronico: step4Data.correoElectronico ? String(step4Data.correoElectronico) : undefined,
      contactoTelefono: step4Data.telefono ? String(step4Data.telefono) : undefined,
      contactoCountryCode: step4Data.countryCode ? String(step4Data.countryCode) : undefined,
      contactoCountryDialCode: step4Data.countryDialCode ? String(step4Data.countryDialCode) : undefined,

      // Paso 5: Dirección de Facturación
      direccionFacturacion: step5Data.direccionFacturacion ? String(step5Data.direccionFacturacion) : undefined,
      regionFacturacion: step5Data.regionFacturacion ? String(step5Data.regionFacturacion) : undefined,
      comunaFacturacion: step5Data.comunaFacturacion ? String(step5Data.comunaFacturacion) : undefined,
      codigoPostalFacturacion: step5Data.codigoPostalFacturacion ? String(step5Data.codigoPostalFacturacion) : undefined,

      // Paso 5: Dirección de Despacho
      direccionDespacho: step5Data.direccionDespacho ? String(step5Data.direccionDespacho) : undefined,
      regionDespacho: step5Data.regionDespacho ? String(step5Data.regionDespacho) : undefined,
      comunaDespacho: step5Data.comunaDespacho ? String(step5Data.comunaDespacho) : undefined,
      codigoPostalDespacho: step5Data.codigoPostalDespacho ? String(step5Data.codigoPostalDespacho) : undefined,
      usarMismaDireccion: step5Data.usarMismaDireccion === true || step5Data.usarMismaDireccion === 'true'
    };
  };

  /**
   * Maneja el envío final del formulario
   */
  const handleSubmit = async (): Promise<void> => {
    try {
      const clientData = mapFormDataToDto();
      
      await createClientMutation.mutateAsync(clientData);
      
      // Mostrar toast de éxito
      toast.success('Cliente creado exitosamente');
      
      // Limpiar datos guardados después de enviar exitosamente
      sessionStorage.removeItem(STORAGE_KEY);
      
      // Navegar de vuelta a la tabla de clientes después de crear exitosamente
      navigate(routes.clients);
    } catch (error) {
      // Mostrar toast de error
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear el cliente';
      toast.error(errorMessage);
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
              className="bg-[#004BB7] text-white hover:bg-blue-600 px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLastStep && createClientMutation.isPending}
            >
              {isLastStep 
                ? (createClientMutation.isPending ? 'Creando Cliente...' : 'Crear Cliente')
                : 'Siguiente'
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

