import clientInfoIcon from '../../../assets/client-info.png';
import personIcon from '../../../assets/contacto.png';
import segmentacionIcon from '../../../assets/segmentacion.png';
import segmentacionActiveIcon from '../../../assets/segmentacionActive.png';
import facturacion from '../../../assets/facturacion.png';
import direccion from '../../../assets/direccion.png';
import completedStepIcon from '../../../assets/completedStep.png';

/**
 * Props del componente ClientStepper
 */
interface ClientStepperProps {
  /**
   * Paso actual activo (1-5)
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
      title: 'Cliente',
      iconSrc: clientInfoIcon,
      completedIconSrc: completedStepIcon
    },
    {
      number: 2,
      title: 'Segmentación',
      iconSrc: segmentacionIcon,
      activeIconSrc: segmentacionActiveIcon,
      completedIconSrc: completedStepIcon
    },
    {
      number: 3,
      title: 'Facturación',
      iconSrc: facturacion,
      completedIconSrc: completedStepIcon
    },
    {
      number: 4,
      title: 'Contacto',
      iconSrc: personIcon,
      completedIconSrc: completedStepIcon
    },
    {
      number: 5,
      title: 'Dirección',
      iconSrc: direccion,
      completedIconSrc: completedStepIcon
    }
  ];

  /**
   * Determina el estado de un paso
   * @param stepNumber - Número del paso
   * @returns Estado del paso: 'completed', 'active', o 'pending'
   */
  const getStepStatus = (stepNumber: number): 'completed' | 'active' | 'pending' => {
    if (stepNumber < currentStep) {
      return 'completed';
    } else if (stepNumber === currentStep) {
      return 'active';
    } else {
      return 'pending';
    }
  };

  /**
   * Obtiene el ícono correcto según el estado del paso
   * @param step - Configuración del paso
   * @param status - Estado del paso
   * @returns Ruta del ícono a mostrar
   */
  const getStepIcon = (step: typeof steps[0], status: 'completed' | 'active' | 'pending'): string => {
    if (status === 'completed' && step.completedIconSrc) {
      return step.completedIconSrc;
    }
    if (status === 'active' && step.activeIconSrc) {
      return step.activeIconSrc;
    }
    return step.iconSrc;
  };

  return (
    <div className="border-r border-gray-200 w-[15%] h-full flex flex-col items-center pr-5">
      <div className="flex flex-col w-[120px] h-[314px] py-6">
        {steps.map((step, index) => {
          const status = getStepStatus(step.number);
          const isActive = status === 'active';
          const isCompleted = status === 'completed';
          const isPending = status === 'pending';
          const isLast = index === steps.length - 1;
          const stepIcon = getStepIcon(step, status);

          return (
            <div key={step.number}>
              <div className="flex items-start">
                <div className="flex flex-col items-center">
                  {stepIcon ? (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isActive || isCompleted 
                        ? '' 
                        : 'bg-white border border-gray-200'
                    }`}>
                      <div className="w-[34px] h-[34px] flex items-center justify-center overflow-hidden">
                        <img
                          src={stepIcon}
                          alt={step.title}
                          className="w-full h-full object-contain"
                          style={{
                            display: 'block',
                            maxWidth: '100%',
                            maxHeight: '100%',
                            filter: isPending ? 'brightness(0) opacity(0.6)' : 'none'
                          }}
                        />
                      </div>
                    </div>
                  ) : null}
                  {!isLast && (
                    <div
                      className={`w-[4px] rounded-full my-2 ${
                        isCompleted
                          ? 'bg-[#12B980]'
                          : 'bg-gray-200'
                      }`}
                      style={{ height: '40px' }}
                    />
                  )}
                </div>
                <div className="pt-1 pl-2">
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-xs leading-tight ${
                      isActive 
                        ? 'text-gray-600' 
                        : isCompleted 
                        ? 'text-gray-400' 
                        : 'text-gray-400'
                    }`}>
                      Paso {step.number}
                    </span>
                    <span className={`text-sm leading-tight ${
                      isActive
                        ? 'text-[#0052C9] font-semibold'
                        : isCompleted
                        ? 'text-gray-600 font-medium'
                        : 'text-gray-600 font-medium'
                    }`}>
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

