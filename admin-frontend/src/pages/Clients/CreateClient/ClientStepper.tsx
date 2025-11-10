import clientInfoIcon from '../../../assets/client-info.png';
import personIcon from '../../../assets/contacto.png';
import segmentacionIcon from '../../../assets/segmentacion.png';
import facturacion from '../../../assets/facturacion.png';
import direccion from '../../../assets/direccion.png';

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
      active: currentStep === 1
    },
    {
      number: 2,
      title: 'Segmentación',
      iconSrc: segmentacionIcon,
      active: currentStep === 2
    },
    {
      number: 3,
      title: 'Facturación',
      iconSrc: facturacion,
      active: currentStep === 3
    },
    {
      number: 4,
      title: 'Contacto',
      iconSrc: personIcon,
      active: currentStep === 4
    },
    {
      number: 5,
      title: 'Dirección',
      iconSrc: direccion,
      active: currentStep === 5
    }
  ];

  return (
    <div className="w-80 p-6 pl-8 border-r border-gray-200 w-[204px] h-full">
      <div className="flex flex-col w-[120px] h-[314px]">
        {steps.map((step, index) => {
          const isActive = step.active;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.number}>
              <div className="flex items-start">
                <div className="flex flex-col items-center">
                  {step.iconSrc ? (
                    <div className="w-[34px] h-[34px] flex items-center justify-center overflow-hidden">
                      <img
                        src={step.iconSrc}
                        alt={step.title}
                        className="w-full h-full object-contain"
                        style={{
                          display: 'block',
                          maxWidth: '100%',
                          maxHeight: '100%'
                        }}
                      />
                    </div>
                  ) : null}
                  {!isLast && (
                    <div
                      className="w-0.5 my-2 bg-gray-200"
                      style={{ height: '40px' }}
                    />
                  )}
                </div>
                <div className="pt-1 pl-2">
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-xs leading-tight ${isActive ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                      Paso {step.number}
                    </span>
                    <span className={`text-sm leading-tight ${isActive
                        ? 'text-gray-900 font-semibold'
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

