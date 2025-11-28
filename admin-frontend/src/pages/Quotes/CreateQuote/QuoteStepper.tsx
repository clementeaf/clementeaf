import step1Icon from '../../../assets/step1.png';
import step2Icon from '../../../assets/step2.png';
import step2ActiveIcon from '../../../assets/step2-active.png';
import step3Icon from '../../../assets/step3.png';
import step3ActiveIcon from '../../../assets/step3-active.png';
import step4Icon from '../../../assets/step4.png';
import step4ActiveIcon from '../../../assets/step4-active.png';
import completedIcon from '../../../assets/completed.png';

/**
 * Props del componente QuoteStepper
 */
interface QuoteStepperProps {
  /**
   * Paso actual activo (1-4)
   */
  currentStep: number;
}

/**
 * Componente Stepper para mostrar los pasos del proceso de creación de orden de compra
 * @param props - Props del componente QuoteStepper
 * @returns Componente QuoteStepper
 */
export const QuoteStepper = ({ currentStep }: QuoteStepperProps) => {
  const steps = [
    {
      number: 1,
      title: 'Cliente',
      iconSrc: step1Icon,
      activeIconSrc: step1Icon,
      completedIconSrc: completedIcon
    },
    {
      number: 2,
      title: 'Condiciones',
      iconSrc: step2Icon,
      activeIconSrc: step2ActiveIcon,
      completedIconSrc: completedIcon
    },
    {
      number: 3,
      title: 'Productos',
      iconSrc: step3Icon,
      activeIconSrc: step3ActiveIcon,
      completedIconSrc: completedIcon
    },
    {
      number: 4,
      title: 'Revisión',
      iconSrc: step4Icon,
      activeIconSrc: step4ActiveIcon,
      completedIconSrc: completedIcon
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
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out ${
                      isActive 
                        ? 'bg-[#0052C9]' 
                        : isCompleted
                        ? 'bg-[#12B980]'
                        : 'bg-white'
                    }`}>
                      <div className="w-[34px] h-[34px] flex items-center justify-center overflow-hidden">
                        <img
                          src={stepIcon}
                          alt={step.title}
                          className="w-full h-full object-contain transition-all duration-300 ease-in-out"
                          style={{
                            display: 'block',
                            maxWidth: '100%',
                            maxHeight: '100%',
                            filter: isPending ? 'brightness(0) opacity(0.6)' : 'none',
                            transition: 'filter 0.3s ease-in-out, opacity 0.3s ease-in-out'
                          }}
                        />
                      </div>
                    </div>
                  ) : null}
                  {!isLast && (
                    <div
                      className={`w-[4px] rounded-full my-2 transition-all duration-300 ease-in-out ${
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
                    <span className={`text-xs leading-tight transition-all duration-300 ease-in-out ${
                      isActive 
                        ? 'text-gray-600' 
                        : isCompleted 
                        ? 'text-gray-400' 
                        : 'text-gray-400'
                    }`}>
                      Paso {step.number}
                    </span>
                    <span className={`text-sm leading-tight transition-all duration-300 ease-in-out ${
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

