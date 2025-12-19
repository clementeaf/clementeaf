import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppModeLanding, AppModeRoute } from './components/AppModeRoute';
import { NotificationsProvider } from './components/Notifications';
import { routes } from './routes';

const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Articles = lazy(() => import('./pages/Articles').then(module => ({ default: module.Articles })));
const Opportunities = lazy(() => import('./pages/Opportunities').then(module => ({ default: module.Opportunities })));
const Components = lazy(() => import('./pages/Components').then(module => ({ default: module.Components })));
const SearchProducts = lazy(() => import('./pages/Products/SearchProducts').then(module => ({ default: module.SearchProducts })));
const Sells = lazy(() => import('./pages/Sells').then(module => ({ default: module.Sells })));
const Clients = lazy(() => import('./pages/Clients').then(module => ({ default: module.Clients })));
const CreateClient = lazy(() => import('./pages/Clients/CreateClient').then(module => ({ default: module.CreateClient })));
const ClientDetails = lazy(() => import('./pages/Clients/ClientDetails/ClientDetails').then(module => ({ default: module.ClientDetails })));
const Quotes = lazy(() => import('./pages/Quotes').then(module => ({ default: module.Quotes })));
const CreateQuote = lazy(() => import('./pages/Quotes/CreateQuote').then(module => ({ default: module.CreateQuote })));
const QuoteDetails = lazy(() => import('./pages/Quotes/QuoteDetails/QuoteDetails').then(module => ({ default: module.QuoteDetails })));
const SalesOrder = lazy(() => import('./pages/SalesOrder').then(module => ({ default: module.SalesOrder })));
const Collections = lazy(() => import('./pages/Collections').then(module => ({ default: module.Collections })));
const Picking = lazy(() => import('./pages/Picking').then(module => ({ default: module.Picking })));
const Analytics = lazy(() => import('./pages/Analytics').then(module => ({ default: module.Analytics })));
const Chat = lazy(() => import('./pages/Chat').then(module => ({ default: module.Chat })));
const Support = lazy(() => import('./pages/Support').then(module => ({ default: module.Support })));
const SupportAdmin = lazy(() => import('./pages/Support/SupportAdmin').then(module => ({ default: module.SupportAdmin })));
const Invoices = lazy(() => import('./pages/Invoices').then(module => ({ default: module.Invoices })));
const RolesManagement = lazy(() => import('./pages/Roles/RolesManagement').then(module => ({ default: module.RolesManagement })));
const CreateRole = lazy(() => import('./pages/Roles/CreateRole').then(module => ({ default: module.CreateRole })));
const PermissionsManagement = lazy(() => import('./pages/Roles/PermissionsManagement').then(module => ({ default: module.PermissionsManagement })));
const UsersManagement = lazy(() => import('./pages/Roles/UsersManagement').then(module => ({ default: module.UsersManagement })));
const CreateUser = lazy(() => import('./pages/Roles/CreateUser').then(module => ({ default: module.CreateUser })));
const WhatsApp = lazy(() => import('./pages/WhatsApp').then(module => ({ default: module.WhatsApp })));
const OCR = lazy(() => import('./pages/OCR/OCR').then(module => ({ default: module.default })));
const Activity = lazy(() => import('./pages/Activity').then(module => ({ default: module.Activity })));
const Finanzas = lazy(() => import('./pages/Finanzas').then(module => ({ default: module.Finanzas })));
const Accounting = lazy(() => import('./pages/Accounting/Accounting').then(module => ({ default: module.Accounting })));

/**
 * Componente de carga para Suspense
 * @returns Componente de carga
 */
const LoadingFallback = (): React.ReactElement => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052C9]"></div>
  </div>
);

/**
 * Componente principal de la aplicación admin
 * @returns Componente App
 */
function App(): React.ReactNode {
  return (
    <NotificationsProvider>
      <div className="w-screen h-screen bg-blue-50/50 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 h-full rounded-lg shadow-sm overflow-hidden min-w-0 flex flex-col">
          <Suspense fallback={<LoadingFallback />}>
          <div className="flex-1 overflow-auto min-h-0">
          <Routes>
            {/* Landing: redirige según modo, pero permite acceso directo a Home */}
            <Route 
              path={routes.home} 
              element={
                <AppModeRoute allowedModes={['ventas', 'bodega', 'admin', 'completo']}>
                  <Home />
                </AppModeRoute>
              } 
            />
            
            {/* Soporte (permitido en todos los modos, excepto Administración que no está en completo) */}
            <Route
              path={routes.support}
              element={
                <AppModeRoute allowedModes={['ventas', 'bodega', 'admin', 'completo']}>
                  <Support />
                </AppModeRoute>
              }
            />
            <Route
              path={routes.supportAdmin}
              element={
                <AppModeRoute allowedModes={['ventas', 'bodega', 'admin']}>
                  <SupportAdmin />
                </AppModeRoute>
              }
            />
            
            {/* Rutas de Ventas */}
            <Route 
              path={routes.sells} 
              element={
                <AppModeRoute allowedModes={['ventas', 'admin', 'completo']}>
                  <ProtectedRoute requiredPermissions={['module:sells', 'view:sells:clients', 'view:sells:quotes', 'view:sells:collections']} requireAny>
                    <Sells />
                  </ProtectedRoute>
                </AppModeRoute>
              } 
            />
            <Route 
              path={routes.clients} 
              element={
                <AppModeRoute allowedModes={['ventas', 'admin', 'completo']}>
                  <ProtectedRoute requiredPermission="view:sells:clients">
                    <Clients />
                  </ProtectedRoute>
                </AppModeRoute>
              } 
            />
            <Route 
              path={routes.createClient} 
              element={
                <AppModeRoute allowedModes={['ventas', 'admin', 'completo']}>
                  <ProtectedRoute requiredPermission="view:sells:clients">
                    <CreateClient />
                  </ProtectedRoute>
                </AppModeRoute>
              } 
            />
            <Route 
              path={`${routes.clientDetails}/:id`} 
              element={
                <AppModeRoute allowedModes={['ventas', 'admin', 'completo']}>
                  <ProtectedRoute requiredPermission="view:sells:clients">
                    <ClientDetails />
                  </ProtectedRoute>
                </AppModeRoute>
              } 
            />
            <Route 
              path={routes.quotes} 
              element={
                <AppModeRoute allowedModes={['ventas', 'admin', 'completo']}>
                  <ProtectedRoute requiredPermission="view:sells:quotes">
                    <Quotes />
                  </ProtectedRoute>
                </AppModeRoute>
              } 
            />
            <Route 
              path={routes.createQuote} 
              element={
                <AppModeRoute allowedModes={['ventas', 'admin', 'completo']}>
                  <ProtectedRoute requiredPermission="view:sells:quotes">
                    <CreateQuote />
                  </ProtectedRoute>
                </AppModeRoute>
              } 
            />
            <Route 
              path={`${routes.quoteDetails}/:id`} 
              element={
                <AppModeRoute allowedModes={['ventas', 'admin', 'completo']}>
                  <ProtectedRoute requiredPermission="view:sells:quotes">
                    <QuoteDetails />
                  </ProtectedRoute>
                </AppModeRoute>
              } 
            />
            <Route 
              path={routes.collections} 
              element={
                <AppModeRoute allowedModes={['ventas', 'admin', 'completo']}>
                  <ProtectedRoute requiredPermission="view:sells:collections">
                    <Collections />
                  </ProtectedRoute>
                </AppModeRoute>
              } 
            />
            
            {/* Rutas de Picking */}
            <Route 
              path={routes.picking} 
              element={
                <AppModeRoute allowedModes={['bodega', 'admin', 'completo']}>
                  <ProtectedRoute requiredPermissions={['module:picking', 'view:picking:order', 'view:picking:metrics', 'view:picking:warehouse']} requireAny>
                    <Picking />
                  </ProtectedRoute>
                </AppModeRoute>
              } 
            />
            <Route 
              path={routes.pickingOrder} 
              element={
                <AppModeRoute allowedModes={['bodega', 'admin', 'completo']}>
                  <ProtectedRoute requiredPermission="view:picking:order">
                    <Picking />
                  </ProtectedRoute>
                </AppModeRoute>
              } 
            />
            <Route 
              path={routes.pickingMetrics} 
              element={
                <AppModeRoute allowedModes={['bodega', 'admin', 'completo']}>
                  <ProtectedRoute requiredPermission="view:picking:metrics">
                    <Picking />
                  </ProtectedRoute>
                </AppModeRoute>
              } 
            />
            <Route 
              path={routes.pickingWarehouse} 
              element={
                <AppModeRoute allowedModes={['bodega', 'admin', 'completo']}>
                  <ProtectedRoute requiredPermission="view:picking:warehouse">
                    <Picking />
                  </ProtectedRoute>
                </AppModeRoute>
              } 
            />
            
            {/* Rutas de Roles */}
            <Route 
              path={routes.rolesManagement} 
              element={
                <AppModeRoute allowedModes={['ventas', 'bodega', 'admin', 'completo']}>
                  <ProtectedRoute requiredPermission="view:roles:roles">
                    <RolesManagement />
                  </ProtectedRoute>
                </AppModeRoute>
              } 
            />
            <Route 
              path={routes.createRole} 
              element={
                <AppModeRoute allowedModes={['ventas', 'bodega', 'admin', 'completo']}>
                  <ProtectedRoute requiredPermission="view:roles:roles">
                    <CreateRole />
                  </ProtectedRoute>
                </AppModeRoute>
              } 
            />
            <Route 
              path={routes.users} 
              element={
                <AppModeRoute allowedModes={['ventas', 'bodega', 'admin', 'completo']}>
                  <ProtectedRoute requiredPermission="view:roles:users">
                    <UsersManagement />
                  </ProtectedRoute>
                </AppModeRoute>
              } 
            />
            <Route 
              path={routes.createUser} 
              element={
                <AppModeRoute allowedModes={['ventas', 'bodega', 'admin', 'completo']}>
                  <ProtectedRoute requiredPermission="view:roles:users">
                    <CreateUser />
                  </ProtectedRoute>
                </AppModeRoute>
              } 
            />
            
            {/* Rutas de Productos */}
            <Route 
              path={routes.productsSearch} 
              element={
                <AppModeRoute allowedModes={['ventas', 'bodega', 'admin', 'completo']}>
                  <ProtectedRoute requiredPermission="view:products:search">
                    <SearchProducts />
                  </ProtectedRoute>
                </AppModeRoute>
              } 
            />
            
            {/* Nota: Los permisos view:products:history y create:products:movements 
                se validan en el backend. El frontend solo valida view:products:search 
                para acceder a la página. */}
            
            {/* Rutas de WhatsApp */}
            <Route 
              path={routes.whatsapp} 
              element={
                <ProtectedRoute requiredPermission="view:whatsapp:status">
                  <WhatsApp />
                </ProtectedRoute>
              } 
            />
            
            {/* Rutas de OCR */}
            <Route 
              path={routes.ocr} 
              element={<OCR />} 
            />
            
            {/* Rutas de Trazabilidad */}
            <Route 
              path={routes.activity} 
              element={<Activity />} 
            />
            
            {/* Rutas de Finanzas */}
            <Route 
              path={routes.finanzas} 
              element={<Finanzas />} 
            />

            {/* Rutas de Contabilidad */}
            <Route
              path={routes.accounting}
              element={
                <ProtectedRoute requiredPermission="view:accounting:overview">
                  <Accounting />
                </ProtectedRoute>
              }
            />
            
            {/* Fallback: cualquier otra ruta redirige según modo */}
            <Route path={routes.notFound} element={<AppModeLanding />} />
          </Routes>
          </div>
        </Suspense>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      </div>
    </NotificationsProvider>
  );
}

export default App
