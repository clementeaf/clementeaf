import logo from '../../assets/b-360.png';
import logoCollapsed from '../../assets/B.png';

/**
 * Props del componente SidebarHeader
 */
interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isExpanded: boolean;
}

/**
 * Componente Header del Sidebar
 * Muestra el logo "B360" y el botón de comprimir/descomprimir
 * @param props - Props del header
 * @returns Componente SidebarHeader
 */
export const SidebarHeader = ({ isCollapsed, onToggleCollapse, isExpanded }: SidebarHeaderProps) => {
  const ExpandIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="6"
        y1="4"
        x2="6"
        y2="16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="6"
        y1="10"
        x2="14"
        y2="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M11 7L14 10L11 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );

  const showCollapsedLogo = isCollapsed && !isExpanded;
  const showNormalLogo = !isCollapsed || isExpanded;

  return (
    <div className="w-full flex flex-col items-center my-6 px-4 gap-4">
      {showNormalLogo && (
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <img src={logo} alt="Logo" className="w-[80px] object-cover" />
        </div>
      )}
      {showCollapsedLogo && (
        <div className="transition-all duration-300 ease-in-out overflow-hidden max-h-32 opacity-100">
          <img src={logoCollapsed} alt="Logo" className="w-[20px] object-cover" />
        </div>
      )}
      <button
        onClick={onToggleCollapse}
        className={`${
          isCollapsed
            ? 'p-2 text-white hover:opacity-80 transition-opacity duration-200 flex items-center justify-center'
            : 'px-4 py-2 bg-[#004BB7] text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors duration-200'
        }`}
      >
        {isCollapsed ? <ExpandIcon /> : 'Comprimir'}
      </button>
    </div>
  );
};

