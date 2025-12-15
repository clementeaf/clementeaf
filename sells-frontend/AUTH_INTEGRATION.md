# Integración de Autenticación - Sells Frontend

Este documento describe cómo `sells-frontend` se integra con `auth-frontend` para manejar la autenticación.

## Flujo de Autenticación

### 1. Verificación Inicial
- Al cargar la aplicación, se verifica si existen tokens en cookies (`authToken` y `refreshToken`)
- Si no hay tokens, se redirige automáticamente a `auth-frontend`
- Si hay tokens, se verifica su validez con el endpoint `/auth/me`

### 2. Login
- El usuario inicia sesión en `auth-frontend` (puerto 8050)
- Después del login exitoso, los tokens se guardan en cookies:
  - `authToken`: Token de acceso JWT
  - `refreshToken`: Token para refrescar el access token
- El usuario puede ser redirigido a `sells-frontend` desde `auth-frontend`

### 3. Protección de Rutas
- Todas las rutas están protegidas con el componente `<ProtectedRoute>`
- Si el usuario no está autenticado, se redirige a `auth-frontend`

### 4. Refresh Automático de Tokens
- El interceptor de Axios detecta errores 401
- Automáticamente intenta refrescar el token usando el `refreshToken`
- Si el refresh falla, limpia los tokens y redirige a `auth-frontend`

## Configuración

### URLs por Entorno

#### Desarrollo (localhost)
- `auth-frontend`: `http://localhost:8050`
- `sells-frontend`: `http://localhost:8600`

#### Producción
- `auth-frontend`: Configurado en CloudFront
- `sells-frontend`: Configurado en CloudFront

### Variables de Entorno

```env
VITE_API_URL=http://localhost:9500/dev  # Para desarrollo local
```

## Estructura de Archivos

```
sells-frontend/src/
├── api/
│   ├── client.ts          # Cliente Axios con interceptores
│   ├── endpoints.ts        # Endpoints del backend
│   └── types.ts           # Tipos TypeScript para API
├── config/
│   └── frontendUrls.ts    # URLs de frontends por entorno
├── store/
│   └── authStore.ts       # Store de Zustand para auth
├── hooks/
│   └── useAuth.ts         # Hook para manejar autenticación
└── components/
    └── ProtectedRoute.tsx # Componente para proteger rutas
```

## Uso

### Hook useAuth

```tsx
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <div>No autenticado</div>;
  }

  return (
    <div>
      <p>Usuario: {user?.email}</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}
```

### ProtectedRoute

```tsx
import { ProtectedRoute } from './components';
import { MyPage } from './pages/MyPage';

function App() {
  return (
    <Routes>
      <Route
        path="/my-page"
        element={
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

### API Client

El cliente API está configurado para agregar automáticamente el token en todas las peticiones:

```tsx
import { apiClient } from './api/client';
import { endpoints } from './api/endpoints';

// El token se agrega automáticamente
const response = await apiClient.get(endpoints.auth.me);
```

## Tokens

### Almacenamiento
- `authToken`: Token de acceso (JWT)
- `refreshToken`: Token para refrescar el access token

### Refresh Automático
- Cuando una petición recibe un 401, se intenta refrescar el token automáticamente
- Si el refresh es exitoso, se reintenta la petición original
- Si el refresh falla, se limpian los tokens y se redirige a `auth-frontend`

## Logout

Para cerrar sesión:

```tsx
const { logout } = useAuth();
logout(); // Limpia tokens y redirige a auth-frontend
```

## Troubleshooting

### Redirección infinita
- Verificar que `auth-frontend` esté corriendo en el puerto correcto (8050)
- Verificar que las URLs en `frontendUrls.ts` sean correctas

### Tokens no se guardan
- Verificar que `auth-frontend` esté guardando tokens en cookies
- Verificar que los nombres de las keys sean `authToken` y `refreshToken`

### Error 401 persistente
- Verificar que el endpoint `/auth/refresh` funcione correctamente
- Verificar que el `refreshToken` sea válido

