import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { routes } from '../routes';
import { Wrapper, FormHeader, Button } from '../components/ui';
import { Form } from '../components/Form';
import { useRegister, useLogin } from '../hooks/useAuth';
import type { ReactNode } from 'react';
import { registerFormConfig, loginFormConfig } from './authForms.config';
import type { RegisterRequest, LoginRequest } from '../api/types';
import { extractErrorMessage } from '../api/client';
import { AppSelector } from './AppSelector';
import { startGoogleLogin, getOAuthSession, clearOAuthSession } from '../utils/googleOAuth';
import { authService } from '../api/auth';
import { COGNITO_REDIRECT_URI } from '../config/cognito';
import { getCookie, setCookie } from '../utils/cookies';

interface OAuthDebugInfo {
  message: string;
  at: string;
  details?: string;
}

/**
 * Componente para el formulario de registro
 */
const RegisterForm = () => {
  const { mutate: register, isPending } = useRegister();
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = (data: RegisterRequest | LoginRequest) => {
    setApiError(null);
    register(data as RegisterRequest, {
      onError: (error) => {
        const errorMessage = extractErrorMessage(
          error,
          'Registration failed. Please try again.'
        );
        setApiError(errorMessage);
      }
    });
  };

  return (
    <div className="w-full flex flex-col items-center">
      <FormHeader subtitle="Registrarse" />
      {apiError && (
        <div className="mb-4 w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {apiError}
        </div>
      )}
      <Form
        {...registerFormConfig}
        onSubmit={handleSubmit}
        isLoading={isPending}
      />
    </div>
  );
};

/**
 * Componente para el formulario de login
 */
const LoginForm = () => {
  const { mutate: login, isPending } = useLogin();
  const [apiError, setApiError] = useState<string | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = sessionStorage.getItem('oauth_last_error');
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === 'object' && 'message' in parsed && typeof (parsed as { message: unknown }).message === 'string') {
        setOauthError((parsed as { message: string }).message);
      }
    } catch {
      setOauthError('Error en inicio de sesión con Google');
    } finally {
      sessionStorage.removeItem('oauth_last_error');
    }
  }, []);

  const handleSubmit = (data: RegisterRequest | LoginRequest) => {
    setApiError(null);
    login(data as LoginRequest, {
      onError: (error) => {
        const errorMessage = extractErrorMessage(
          error,
          'Login failed. Please check your credentials.'
        );
        setApiError(errorMessage);
      }
    });
  };

  const handleRegisterClick = () => {
    navigate(routes.auth.register);
  };

  /**
   * Inicia login con Google vía Cognito Hosted UI
   */
  const handleGoogleLogin = async (): Promise<void> => {
    setOauthError(null);
    sessionStorage.removeItem('oauth_last_error');
    try {
      await startGoogleLogin();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo iniciar sesión con Google';
      setOauthError(message);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <FormHeader subtitle="Iniciar sesión" />
      {apiError && (
        <div className="mb-4 w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {apiError}
        </div>
      )}
      {oauthError && (
        <div className="mb-4 w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {oauthError}
        </div>
      )}
      <Form
        {...loginFormConfig}
        onSubmit={handleSubmit}
        isLoading={isPending}
        forgotPasswordLink={
          <a 
            href="#" 
            className="text-sm text-blue-500 hover:text-blue-700 hover:underline"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            Olvidaste tu contraseña?
          </a>
        }
        registerLink={
          <button
            type="button"
            onClick={handleRegisterClick}
            className="text-sm text-blue-500 hover:text-blue-700 hover:border-blue-700 transition-colors duration-200 bg-transparent"
          >
            Registro
          </button>
        }
      />
      <div className="w-full px-4 mt-4">
        <Button
          type="button"
          onClick={handleGoogleLogin}
          className="border-2 border-gray-300 rounded-xl px-4 py-2 text-md text-gray-700 hover:bg-gray-50 ease-in-out duration-300 w-full mt-0 flex items-center justify-center gap-3"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 48 48"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.72 1.22 9.23 3.62l6.9-6.9C35.9 2.38 30.36 0 24 0 14.62 0 6.54 5.38 2.62 13.22l8.02 6.23C12.53 13.42 17.82 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.1 24.5c0-1.57-.14-3.08-.41-4.54H24v8.6h12.4c-.54 2.9-2.2 5.36-4.7 7.02l7.2 5.58C43.15 37.3 46.1 31.4 46.1 24.5z"
            />
            <path
              fill="#FBBC05"
              d="M10.64 28.5c-.48-1.43-.76-2.95-.76-4.5s.28-3.07.76-4.5l-8.02-6.23C.92 16.78 0 20.28 0 24c0 3.72.92 7.22 2.62 10.73l8.02-6.23z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.36 0 11.7-2.1 15.6-5.7l-7.2-5.58c-2 1.35-4.56 2.15-8.4 2.15-6.18 0-11.47-3.92-13.36-9.45l-8.02 6.23C6.54 42.62 14.62 48 24 48z"
            />
            <path fill="none" d="M0 0h48v48H0z" />
          </svg>
          <span>Continuar con Google</span>
        </Button>
      </div>
    </div>
  );
};

/**
 * Página de callback OAuth para completar login con Google
 */
const OAuthCallback = (): ReactNode => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const hasRunRef = useRef<boolean>(false);

  useEffect(() => {
    if (hasRunRef.current) {
      return;
    }
    hasRunRef.current = true;

    const run = async (): Promise<void> => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const state = params.get('state');
      const debug = params.get('debug') === '1' || import.meta.env.DEV;
      const { state: savedState, codeVerifier } = getOAuthSession();

      if (!code) {
        const msg = 'No se recibió código de autenticación';
        setError(msg);
        sessionStorage.setItem('oauth_last_error', JSON.stringify({ message: msg, at: new Date().toISOString() } satisfies OAuthDebugInfo));
        setIsProcessing(false);
        return;
      }
      if (!state || !savedState || state !== savedState) {
        const existingToken = getCookie('authToken');
        if (existingToken) {
          if (!debug) {
            navigate(routes.auth.selectApp);
          } else {
            setIsSuccess(true);
            setIsProcessing(false);
          }
          return;
        }
        const msg = 'Estado OAuth inválido';
        setError(msg);
        sessionStorage.setItem('oauth_last_error', JSON.stringify({ message: msg, at: new Date().toISOString() } satisfies OAuthDebugInfo));
        setIsProcessing(false);
        return;
      }
      if (!codeVerifier) {
        const msg = 'No se encontró verificador PKCE';
        setError(msg);
        sessionStorage.setItem('oauth_last_error', JSON.stringify({ message: msg, at: new Date().toISOString() } satisfies OAuthDebugInfo));
        setIsProcessing(false);
        return;
      }

      try {
        const resp = await authService.oauthCallback({
          code,
          redirectUri: COGNITO_REDIRECT_URI,
          codeVerifier
        });

        if (resp.data.token) {
          setCookie('authToken', resp.data.token);
        }
        if (resp.data.refreshToken) {
          setCookie('refreshToken', resp.data.refreshToken, { maxAgeSeconds: 60 * 60 * 24 * 30 });
        }
        clearOAuthSession();
        sessionStorage.removeItem('oauth_last_error');
        setIsSuccess(true);
        setIsProcessing(false);
        if (!debug) {
          navigate(routes.auth.selectApp);
        }
      } catch (err) {
        const message = extractErrorMessage(err, 'No se pudo completar el inicio de sesión con Google');
        setError(message);
        sessionStorage.setItem(
          'oauth_last_error',
          JSON.stringify({ message, at: new Date().toISOString() } satisfies OAuthDebugInfo)
        );
        setIsProcessing(false);
      }
    };

    void run();
  }, [location.search, navigate]);

  return (
    <div className="w-full flex flex-col items-center">
      <FormHeader subtitle="Procesando inicio de sesión" />
      {error ? (
        <div className="mt-4 w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      ) : isSuccess ? (
        <div className="mt-4 w-full space-y-3">
          <p className="text-sm text-gray-600">Autenticación completada.</p>
          <button
            type="button"
            onClick={() => navigate(routes.auth.selectApp)}
            className="border-2 border-blue-500 rounded-xl px-4 py-2 text-md text-blue-500 hover:bg-blue-500 hover:text-white ease-in-out duration-300 w-full"
          >
            Continuar
          </button>
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-600">{isProcessing ? 'Redirigiendo...' : 'Listo'}</p>
      )}
    </div>
  );
};

/**
 * Mapeo de rutas a contenido
 */
const routeContent: Record<string, ReactNode> = {
  [routes.root]: <LoginForm />,
  [routes.auth.register]: <RegisterForm />,
  [routes.auth.selectApp]: <AppSelector />,
  [routes.auth.oauthCallback]: <OAuthCallback />
};

/**
 * Contenido por defecto para rutas no encontradas
 */
const defaultContent: ReactNode = <div>404 - Page Not Found</div>;

/**
 * Componente de página única que responde a todas las rutas
 * Cambia el contenido según la ruta actual
 */
export const AuthPage = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  /**
   * Obtiene el contenido según la ruta actual
   */
  const content = routeContent[currentPath] ?? defaultContent;

  return (
    <Wrapper className='flex flex-col items-center justify-center bg-white rounded-lg shadow-sm p-4 w-auto min-w-[400px]'>
      {content}
    </Wrapper>
  );
};

