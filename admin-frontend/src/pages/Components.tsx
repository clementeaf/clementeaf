import { useState } from 'react';
import { ComponentList } from './Components/ComponentList';
import { ContentArea } from './Components/ContentArea';
import { ButtonsContent } from './Components/ButtonsContent';

/**
 * Página de componentes
 * @returns Componente Components
 */
export const Components = () => {
  const [selectedComponent, setSelectedComponent] = useState<string | null>('Botones');

  const handleSelectComponent = (component: string): void => {
    setSelectedComponent(component);
  };

  const renderContent = (): React.ReactNode => {
    switch (selectedComponent) {
      case 'Botones':
        return <ButtonsContent />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden p-4">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Componentes</h1>
        <p className="text-gray-600">Gestión de componentes</p>
      </div>

      <div className="flex gap-6 flex-1 min-h-0 overflow-hidden">
        <ComponentList
          selectedComponent={selectedComponent}
          onSelectComponent={handleSelectComponent}
        />
        <ContentArea>{renderContent()}</ContentArea>
      </div>
    </div>
  );
};

