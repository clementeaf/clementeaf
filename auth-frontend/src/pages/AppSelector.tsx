import { Wrapper, FormHeader } from '../components/ui';
import { Button } from '../components/ui/Button';
import { getFrontendUrls } from '../config/frontendUrls';
import { getCookie } from '../utils/cookies';

/**
 * Redirige a la aplicación seleccionada con el token y refresh token en la URL
 * @param url - URL de la aplicación a la que redirigir
 */
const redirectToApp = (url: string): void => {
  const token = getCookie('authToken');
  const refreshToken = getCookie('refreshToken');
  
  if (token) {
    const separator = url.includes('?') ? '&' : '?';
    let redirectUrl = `${url}${separator}token=${encodeURIComponent(token)}`;
    
    if (refreshToken) {
      redirectUrl += `&refreshToken=${encodeURIComponent(refreshToken)}`;
    }
    
    window.location.href = redirectUrl;
  } else {
    window.location.href = url;
  }
};

/**
 * Componente provisional para seleccionar la aplicación después del login exitoso
 * @returns Componente AppSelector
 */
export const AppSelector = (): React.ReactNode => {
  const frontendUrls = getFrontendUrls();
  
  return (
    <Wrapper className='flex flex-col items-center justify-center bg-white rounded-lg shadow-sm p-8 w-auto min-w-[400px]'>
      <FormHeader subtitle="Selecciona una aplicación" />
      
      <div className="w-full mt-6 space-y-4">
        <p className="text-sm text-gray-600 text-center mb-6">
          Has iniciado sesión exitosamente. Elige a qué aplicación deseas acceder:
        </p>
        
        <div className="space-y-3">
          <Button
            type="button"
            onClick={() => redirectToApp(frontendUrls.admin)}
            className="w-full py-3 text-base font-medium border-2 border-blue-500 rounded-xl px-4 text-blue-500 hover:bg-blue-500 hover:text-white ease-in-out duration-300"
          >
            Admin Frontend
          </Button>
          
          <Button
            type="button"
            onClick={() => redirectToApp(frontendUrls.client)}
            className="w-full py-3 text-base font-medium border-2 border-blue-500 rounded-xl px-4 text-blue-500 hover:bg-blue-500 hover:text-white ease-in-out duration-300"
          >
            Client Frontend
          </Button>
        </div>
      </div>
    </Wrapper>
  );
};

