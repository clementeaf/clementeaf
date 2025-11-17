import { type ReactNode } from 'react';

/**
 * Props del componente Tabs
 */
export interface TabsProps {
  /**
   * Tabs a mostrar
   */
  tabs: TabItem[];
  /**
   * Tab activo
   */
  activeTab: string;
  /**
   * Callback cuando se cambia de tab
   */
  onTabChange: (tabId: string) => void;
  /**
   * Clases CSS adicionales para el contenedor
   */
  containerClassName?: string;
  /**
   * Clases CSS adicionales para la lista de tabs
   */
  tabsListClassName?: string;
  /**
   * Clases CSS adicionales para cada tab
   */
  tabClassName?: string;
  /**
   * Clases CSS adicionales para el tab activo
   */
  activeTabClassName?: string;
  /**
   * Variante del diseño (horizontal o vertical)
   */
  variant?: 'horizontal' | 'vertical';
}

/**
 * Item de tab
 */
export interface TabItem {
  /**
   * ID único del tab
   */
  id: string;
  /**
   * Etiqueta del tab
   */
  label: string;
  /**
   * Contenido del tab
   */
  content: ReactNode;
  /**
   * Ícono opcional
   */
  icon?: ReactNode;
  /**
   * Badge opcional (contador, etc.)
   */
  badge?: string | number;
}

/**
 * Componente Tabs reutilizable
 * @param props - Props del componente Tabs
 * @returns Componente Tabs
 */
export const Tabs = ({
  tabs,
  activeTab,
  onTabChange,
  containerClassName = '',
  tabsListClassName = '',
  tabClassName = '',
  activeTabClassName = '',
  variant = 'horizontal'
}: TabsProps): React.ReactElement => {
  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  if (variant === 'vertical') {
    return (
      <div className={`flex ${containerClassName}`}>
        <div className={`flex flex-col border-r border-gray-200 pr-4 ${tabsListClassName}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                px-4 py-2 text-left transition-colors duration-200
                ${tab.id === activeTab 
                  ? `text-[#004BB7] font-medium border-r-2 border-[#004BB7] ${activeTabClassName}` 
                  : 'text-gray-600 hover:text-gray-900'
                }
                ${tabClassName}
              `}
            >
              <div className="flex items-center gap-2">
                {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
        <div className="flex-1 pl-4">
          {activeTabContent}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${containerClassName}`}>
      <div className={`flex border-b border-gray-200 flex-shrink-0 ${tabsListClassName}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-4 py-3 text-sm font-medium transition-colors duration-200 relative
              ${tab.id === activeTab 
                ? `text-[#004BB7] ${activeTabClassName}` 
                : 'text-gray-600 hover:text-gray-900'
              }
              ${tabClassName}
            `}
          >
            <div className="flex items-center gap-2">
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </div>
            {tab.id === activeTab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#004BB7]" />
            )}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden mt-4 min-h-0">
        {activeTabContent}
      </div>
    </div>
  );
};

