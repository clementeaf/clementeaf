import logo from '../../assets/b-360.png';

/**
 * Componente Header del Sidebar
 * Muestra el logo "B360"
 * @returns Componente SidebarHeader
 */
export const SidebarHeader = () => {
  return (
    <div className="w-full flex items-center justify-center my-6 px-4">
      <img src={logo} alt="Logo" className="w-[80px] object-cover" />
    </div>
  );
};

