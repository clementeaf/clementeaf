import logo from '../../assets/b-360.png';

/**
 * Componente Header del Sidebar
 * @returns Componente SidebarHeader
 */
export const SidebarHeader = (): React.ReactElement => {
  return (
    <div className="w-full flex flex-col items-center my-6 px-4 gap-4">
      <img src={logo} alt="Logo" className="w-[80px] object-cover" />
    </div>
  );
};

