import { Input } from '../../../components/commons';
import { Button } from '../../../components/commons';
import { ChevronRightIcon } from '../../../components/commons/icons';

/**
 * Props del componente ClientInfoForm
 */
interface ClientInfoFormProps {
  /**
   * Función para manejar el siguiente paso
   */
  onNext?: () => void;
}

/**
 * Componente Formulario de información del cliente (Paso 1)
 * @param props - Props del componente ClientInfoForm
 * @returns Componente ClientInfoForm
 */
export const ClientInfoForm = ({ onNext }: ClientInfoFormProps) => {
  return (
    <div className="flex-1 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6">Información del cliente</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Input
          label="RUT"
          value="76.543.210-9"
          inputClassName="bg-white"
          containerClassName="col-span-1"
        />
        <Input
          label="Razón social"
          value="Los Andes Servicios Integrales SpA"
          inputClassName="bg-white"
          containerClassName="col-span-1"
        />
        <Input
          label="Nombre del cliente"
          value="Comercial Los Andes Ltda."
          inputClassName="bg-white"
          containerClassName="col-span-2"
        />
        <Input
          label="RUT completo"
          value="76.543.210-9"
          inputClassName="bg-white"
          containerClassName="col-span-2"
        />
        <Input
          label="Giro"
          value="Venta de artículos de aseo industrial"
          inputClassName="bg-white"
          containerClassName="col-span-1"
        />
        <Input
          label="Sitio web"
          value="www.comercialesandes.cl"
          inputClassName="bg-white"
          containerClassName="col-span-1"
        />
      </div>
      <div className="flex justify-end">
        <Button
          onClick={onNext}
          rightIcon={<ChevronRightIcon color="white" />}
          className="bg-[#004BB7] text-white hover:bg-blue-600 px-6 py-2"
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};

