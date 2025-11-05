import logo from '../../assets/B.png';

/**
 * Props del componente FormHeader
 */
export interface FormHeaderProps {
  subtitle: string;
}

/**
 * Componente header reutilizable para formularios de autenticación
 * Muestra el logo de Grupo Bañados y un subtítulo
 * @param props - Props del header
 * @returns Componente FormHeader
 */
export const FormHeader = ({ subtitle }: FormHeaderProps) => {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-2 pt-4">
      <div className="w-10 h-10 bg-[#002254] rounded-full flex items-center justify-center">
        <img src={logo} alt="Logo" className="w-3 object-cover" />
      </div>
      <h2 className="text-lg font-medium text-gray-600">{subtitle}</h2>
    </div>
  );
};

