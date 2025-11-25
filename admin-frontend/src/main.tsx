import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import App from './App.tsx'

/**
 * Extrae el token y refresh token de la URL y los guarda en localStorage
 * Luego limpia la URL para evitar exponer los tokens
 */
const handleTokenFromUrl = (): void => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const refreshToken = urlParams.get('refreshToken');
  
  if (token) {
    // Guardar el token en localStorage
    localStorage.setItem('authToken', token);
    
    // Si hay refresh token, guardarlo también
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
