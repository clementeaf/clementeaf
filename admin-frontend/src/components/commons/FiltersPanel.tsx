import { useState } from 'react';
import { DropdownIcon, ChevronUpIcon } from './icons';

/**
 * Configuración de una sección de filtro
 */
export interface FilterSection {
  /**
   * ID único de la sección
   */
  id: string;
  /**
   * Label de la sección
   */
  label: string;
  /**
   * Contenido de la sección (opcional)
   */
  content?: React.ReactNode;
}

/**
 * Props del componente FiltersPanel
 */
export interface FiltersPanelProps {
  /**
   * Secciones de filtros a mostrar
   */
  sections?: FilterSection[];
  /**
   * Clases CSS adicionales
   */
  className?: string;
}

/**
 * Componente Panel de filtros genérico
 * @param props - Props del componente FiltersPanel
 * @returns Componente FiltersPanel
 */
export const FiltersPanel = ({ 
  sections = [
    { id: 'system', label: 'Definidos por sistema' },
    { id: 'fields', label: 'Por campos' }
  ], 
  className = '' 
}: FiltersPanelProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  /**
   * Maneja el toggle de una sección
   * @param sectionId - ID de la sección
   */
  const toggleSection = (sectionId: string): void => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  return (
    <div className={`w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <h2 className="text-lg font-bold text-gray-800 mb-4">Filtros</h2>
      <div className="flex flex-col gap-4">
        {sections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const hasContent = Boolean(section.content);
          return (
            <div key={section.id}>
              {hasContent ? (
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
                >
                  <span>{section.label}</span>
                  {isExpanded ? (
                    <ChevronUpIcon color="#6B7280" />
                  ) : (
                    <DropdownIcon color="#6B7280" />
                  )}
                </button>
              ) : (
                <div className="w-full text-sm font-medium text-gray-700">
                  {section.label}
                </div>
              )}
              {isExpanded && hasContent && (
                <div className="mt-2 pl-4 text-sm text-gray-600">
                  {section.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

