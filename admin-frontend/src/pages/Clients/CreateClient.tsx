import { useState } from 'react';
import { CreateClientHeader } from './CreateClient/CreateClientHeader';
import { ClientStepper } from './CreateClient/ClientStepper';
import { ClientInfoForm } from './CreateClient/ClientInfoForm';

/**
 * Página de crear cliente
 * @returns Componente CreateClient
 */
export const CreateClient = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = (): void => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const renderStepContent = (): React.ReactNode => {
    switch (currentStep) {
      case 1:
        return <ClientInfoForm onNext={handleNext} />;
      case 2:
        return <div>Paso 2: Segmentación (TODO)</div>;
      case 3:
        return <div>Paso 3: Facturación (TODO)</div>;
      case 4:
        return <div>Paso 4: Contacto (TODO)</div>;
      case 5:
        return <div>Paso 5: Dirección (TODO)</div>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-8">
      <CreateClientHeader />

      <div className="flex gap-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <ClientStepper currentStep={currentStep} />
        <div className="w-full px-[100px] py-6">{renderStepContent()}</div>
      </div>
    </div>
  );
};

