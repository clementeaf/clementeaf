import { useState, useEffect } from 'react';
import { Wrapper, FormHeader } from '../components/ui';
import { Button } from '../components/ui/Button';
import { getFrontendUrls } from '../config/frontendUrls';
import { getCookie } from '../utils/cookies';
import { getEmailFromToken, isAuthorizedForAdminGeneral } from '../utils/jwt';

type AdminMode = 'ventas' | 'bodega' | 'admin' | 'completo';

/**
 * Redirige a la aplicación admin con el token, refresh token y modo en la URL.
 * @param url - URL de la aplicación admin
 * @param mode - Modo seleccionado
 */
const redirectToAdminWithMode = (url: string, mode: AdminMode): void => {
  const token = getCookie('authToken');
  const refreshToken = getCookie('refreshToken');
  
  if (token) {
    const separator = url.includes('?') ? '&' : '?';
    let redirectUrl = `${url}${separator}token=${encodeURIComponent(token)}&mode=${encodeURIComponent(mode)}`;
    
    if (refreshToken) {
      redirectUrl += `&refreshToken=${encodeURIComponent(refreshToken)}`;
    }
    
    window.location.href = redirectUrl;
  } else {
    window.location.href = `${url}?mode=${encodeURIComponent(mode)}`;
  }
};

/**
 * Componente para seleccionar modo de operación después del login exitoso
 * @returns Componente AppSelector
 */
export const AppSelector = (): React.ReactNode => {
  const frontendUrls = getFrontendUrls();
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);

  /**
   * Verifica si el usuario actual está autorizado para acceso de administrador general
   */
  useEffect(() => {
    const email = getEmailFromToken();
    setIsAdminAuthorized(isAuthorizedForAdminGeneral(email));
  }, []);

  return (
    <Wrapper className='flex flex-col items-center justify-center bg-white rounded-lg shadow-sm p-8 w-auto min-w-[400px]'>
      <FormHeader subtitle="Selecciona un modo" />
      
      <div className="w-full mt-6 space-y-4">
        <p className="text-sm text-gray-600 text-center mb-6">
          Has iniciado sesión exitosamente. Elige el modo de trabajo:
        </p>
        
        <div className="space-y-3">
          <Button
            type="button"
            onClick={() => redirectToAdminWithMode(frontendUrls.admin, 'ventas')}
            className="w-full py-3 text-base font-medium border-2 border-blue-500 rounded-xl px-4 text-blue-500 hover:bg-blue-500 hover:text-white ease-in-out duration-300"
          >
            Ventas
          </Button>
          
          <Button
            type="button"
            onClick={() => redirectToAdminWithMode(frontendUrls.admin, 'bodega')}
            className="w-full py-3 text-base font-medium border-2 border-blue-500 rounded-xl px-4 text-blue-500 hover:bg-blue-500 hover:text-white ease-in-out duration-300"
          >
            Bodega
          </Button>

          <Button
            type="button"
            onClick={() => redirectToAdminWithMode(frontendUrls.admin, 'completo')}
            className="w-full py-3 text-base font-medium border-2 border-blue-500 rounded-xl px-4 text-blue-500 hover:bg-blue-500 hover:text-white ease-in-out duration-300"
          >
            Completo
          </Button>

          {isAdminAuthorized && (
            <Button
              type="button"
              onClick={() => redirectToAdminWithMode(frontendUrls.admin, 'admin')}
              className="w-full py-3 text-base font-medium border-2 border-blue-500 rounded-xl px-4 text-blue-500 hover:bg-blue-500 hover:text-white ease-in-out duration-300"
            >
              Admin General
            </Button>
          )}
        </div>
      </div>
    </Wrapper>
  );
};

