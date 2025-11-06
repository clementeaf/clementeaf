import { Wrapper, FormHeader } from '../components/ui';
import { Button } from '../components/ui/Button';

/**
 * URLs de los frontends en CloudFront
 */
const FRONTEND_URLS = {
  admin: 'https://d13cunasrg048d.cloudfront.net',
  client: 'https://d30lw2uu9x30lw.cloudfront.net'
};

/**
 * Redirige a la aplicación seleccionada
 * @param url - URL de la aplicación a la que redirigir
 */
const redirectToApp = (url: string): void => {
  window.location.href = url;
};

/**
 * Componente provisional para seleccionar la aplicación después del login exitoso
 * @returns Componente AppSelector
 */
export const AppSelector = (): React.ReactNode => {
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
            onClick={() => redirectToApp(FRONTEND_URLS.admin)}
            className="w-full py-3 text-base font-medium border-2 border-blue-500 rounded-xl px-4 text-blue-500 hover:bg-blue-500 hover:text-white ease-in-out duration-300"
          >
            Admin Frontend
          </Button>
          
          <Button
            type="button"
            onClick={() => redirectToApp(FRONTEND_URLS.client)}
            className="w-full py-3 text-base font-medium border-2 border-blue-500 rounded-xl px-4 text-blue-500 hover:bg-blue-500 hover:text-white ease-in-out duration-300"
          >
            Client Frontend
          </Button>
        </div>
      </div>
    </Wrapper>
  );
};

