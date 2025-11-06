import clientInfoIcon from '../../../assets/client-info.png';
import personIcon from '../../../assets/person.png';

/**
 * Props del componente ClientStepper
 */
interface ClientStepperProps {
  /**
   * Paso actual activo (1-4)
   */
  currentStep: number;
}

/**
 * Componente Stepper para mostrar los pasos del proceso de creación de cliente
 * @param props - Props del componente ClientStepper
 * @returns Componente ClientStepper
 */
export const ClientStepper = ({ currentStep }: ClientStepperProps) => {
  const steps = [
    {
      number: 1,
      title: 'Información del cliente',
      iconSrc: clientInfoIcon,
      active: currentStep === 1
    },
    {
      number: 2,
      title: 'Datos de facturación',
      iconSrc: personIcon,
      active: currentStep === 2
    },
    {
      number: 3,
      title: 'Contacto principal',
      iconSrc: personIcon,
      active: currentStep === 3
    },
    {
      number: 4,
      title: 'Dirección',
      iconSrc: null,
      active: currentStep === 4
    }
  ];

  return (
    <div className="w-80 p-6 pl-12 border-r border-gray-200 bg-white rounded-lg shadow-sm relative">
      <div className="flex flex-col gap-4">
        {steps.map((step) => {
          const isActive = step.active;

          return (
            <div key={step.number}>
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 flex items-center justify-center`}
                  >
                    {step.iconSrc ? (
                      <img
                        src={step.iconSrc}
                        alt={step.title}
                        className={`h-12 object-contain`}
                      />
                    ) : (
                      <div></div>
                    )}
                  </div>
                </div>
                <div className="flex-1 pt-1 pb-6">
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-sm leading-tight ${isActive ? 'text-gray-500' : 'text-gray-400'}`}>
                      Paso {step.number}
                    </span>
                    <span className={`text-sm font-medium leading-tight ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                      {step.title}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

