import { Navigate } from 'react-router-dom';
import { getFrontendUrls } from '../config/frontendUrls';
import { getDefaultPathForMode, getStoredAppMode, type AppMode } from '../utils/appMode';

interface AppModeRouteProps {
  children: React.ReactElement;
  allowedModes: AppMode[];
}

/**
 * Protege una ruta según el modo seleccionado (Ventas/Bodega).
 * Si no hay modo seleccionado, redirige al auth-frontend para seleccionar.
 * @param props - Props del componente
 * @returns Children si está permitido; si no, redirección
 */
export const AppModeRoute = ({ children, allowedModes }: AppModeRouteProps): React.ReactElement => {
  const mode = getStoredAppMode();

  if (!mode) {
    const { auth } = getFrontendUrls();
    window.location.assign(`${auth}/select-app`);
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052C9] mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  if (!allowedModes.includes(mode)) {
    return <Navigate to={getDefaultPathForMode(mode)} replace />;
  }

  return children;
};

/**
 * Redirige a la ruta por defecto según el modo seleccionado.
 * Si no hay modo, redirige a selección en auth-frontend.
 * @returns Redirección correspondiente
 */
export const AppModeLanding = (): React.ReactElement => {
  const mode = getStoredAppMode();
  if (!mode) {
    const { auth } = getFrontendUrls();
    window.location.assign(`${auth}/select-app`);
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052C9] mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return <Navigate to={getDefaultPathForMode(mode)} replace />;
};


