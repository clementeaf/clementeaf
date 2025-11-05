import { BuildingIcon, PersonIcon, LocationIcon } from '../../../components/commons/icons';

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
      icon: BuildingIcon,
      active: currentStep === 1
    },
    {
      number: 2,
      title: 'Datos de facturación',
      icon: PersonIcon,
      active: currentStep === 2
    },
    {
      number: 3,
      title: 'Contacto principal',
      icon: PersonIcon,
      active: currentStep === 3
    },
    {
      number: 4,
      title: 'Dirección',
      icon: LocationIcon,
      active: currentStep === 4
    }
  ];

  return (
    <div className="w-80 p-6 pl-12 border-r border-gray-200">
      <div className="relative">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.active;
          const isPast = currentStep > step.number;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.number} className="relative">
              <div className="flex items-start gap-4">
                <div className="relative flex flex-col items-center">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 z-10 relative ${
                      isActive
                        ? 'bg-[#004BB7] text-white'
                        : isPast
                          ? 'bg-gray-300 text-gray-600'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <Icon color={isActive ? 'white' : isPast ? '#6B7280' : '#9CA3AF'} />
                  </div>
                  {!isLast && (
                    <div
                      className={`absolute top-10 left-1/2 transform -translate-x-1/2 transition-colors duration-200 ${
                        isPast || isActive ? 'bg-[#004BB7] w-1' : 'bg-gray-200 w-0.5'
                      } h-20`}
                    />
                  )}
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

