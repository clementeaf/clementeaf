import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import App from './App.tsx'
import { deleteCookie, setCookie } from './utils/cookies'
import { parseAppMode, setStoredAppMode } from './utils/appMode'

/**
 * Valida que un token sea un JWT válido
 * @param token - Token a validar
 * @returns true si el token es un JWT válido, false en caso contrario
 */
const isValidJWT = (token: string): boolean => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  
  try {
    // Intentar decodificar el header y payload para verificar que sean JSON válidos
    JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Extrae el token y refresh token de la URL y los guarda en cookies
 * Luego limpia la URL para evitar exponer los tokens
 */
const handleTokenFromUrl = (): void => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const refreshToken = urlParams.get('refreshToken');
  const modeParam = urlParams.get('mode');
  
  if (token) {
    // Validar que el token sea un JWT válido antes de guardarlo
    if (!isValidJWT(token)) {
      console.error('❌ [AUTH] Token recibido no es un JWT válido:', token.substring(0, 50) + '...');
      console.error('❌ [AUTH] Token parts:', token.split('.').length, '(expected: 3)');
      
      deleteCookie('authToken');
      deleteCookie('refreshToken');
      
      // Redirigir a auth frontend
      window.location.href = 'https://d1wdj9ggvinelv.cloudfront.net';
      return;
    }
    
    setCookie('authToken', token);
    console.log('✅ [AUTH] Token JWT válido guardado en cookie');
    
    // El refresh token de Cognito NO es un JWT, es un token opaco
    // Solo validamos que exista, no su estructura
    if (refreshToken) {
      setCookie('refreshToken', refreshToken, { maxAgeSeconds: 60 * 60 * 24 * 30 });
      console.log('✅ [AUTH] Refresh token guardado en cookie');
    }
    
    // Limpiar la URL removiendo los parámetros de token
    urlParams.delete('token');
    urlParams.delete('refreshToken');
    const newUrl = urlParams.toString() 
      ? `${window.location.pathname}?${urlParams.toString()}`
      : window.location.pathname;
    
    // Reemplazar la URL sin recargar la página
    window.history.replaceState({}, '', newUrl);
  }

  // Persistir modo si viene en URL, incluso si no viene token (por ejemplo, deep link)
  const parsedMode = parseAppMode(modeParam);
  if (parsedMode) {
    setStoredAppMode(parsedMode);
  }

  // Limpiar el parámetro mode de la URL (si existe), aunque no haya token
  if (modeParam) {
    urlParams.delete('mode');
    const newUrl = urlParams.toString()
      ? `${window.location.pathname}?${urlParams.toString()}`
      : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }
};

/**
 * Configuración de QueryClient para evitar refetches innecesarios
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos - los datos se consideran frescos por 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos - tiempo de garbage collection (antes cacheTime)
      refetchOnWindowFocus: false, // No refetch al cambiar de pestaña
      refetchOnMount: false, // No refetch al montar el componente si los datos están frescos
      refetchOnReconnect: true // Refetch solo al reconectar internet
    }
  }
})

// Manejar token de la URL antes de renderizar la app
handleTokenFromUrl();

// Log de inicio de aplicación
console.log('🚀 [APP] Admin Frontend iniciado');
console.log('📋 [APP] Verificando sesión de usuario...');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
