import { type ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Layout base responsive para la aplicación
 * @param children - Contenido a renderizar
 * @param className - Clases CSS adicionales
 * @returns Componente Layout
 */
export function Layout({ children, className = '' }: LayoutProps): React.ReactElement {
  return (
    <div className={`min-h-screen w-full ${className}`}>
      <div className="container-responsive">
        {children}
      </div>
    </div>
  );
}

