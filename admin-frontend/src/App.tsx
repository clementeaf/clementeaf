import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';
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
const Invoices = lazy(() => import('./pages/Invoices').then(module => ({ default: module.Invoices })));
const RolesManagement = lazy(() => import('./pages/Roles/RolesManagement').then(module => ({ default: module.RolesManagement })));
const CreateRole = lazy(() => import('./pages/Roles/CreateRole').then(module => ({ default: module.CreateRole })));
const PermissionsManagement = lazy(() => import('./pages/Roles/PermissionsManagement').then(module => ({ default: module.PermissionsManagement })));
const UsersManagement = lazy(() => import('./pages/Roles/UsersManagement').then(module => ({ default: module.UsersManagement })));
const CreateUser = lazy(() => import('./pages/Roles/CreateUser').then(module => ({ default: module.CreateUser })));
const WhatsApp = lazy(() => import('./pages/WhatsApp').then(module => ({ default: module.WhatsApp })));
const OCR = lazy(() => import('./pages/OCR/OCR').then(module => ({ default: module.default })));
const Activity = lazy(() => import('./pages/Activity').then(module => ({ default: module.Activity })));

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
      <div className="w-screen h-screen bg-blue-50/50 flex">
        <Sidebar />
        <div className="w-full h-full rounded-lg shadow-sm overflow-auto">
          <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Rutas públicas (sin restricción de permisos) */}
            <Route path={routes.home} element={<Home />} />
            <Route path={routes.chat} element={<Chat />} />
            <Route path={routes.support} element={<Support />} />
            
            {/* Rutas de Ventas */}
            <Route 
              path={routes.sells} 
              element={
                <ProtectedRoute requiredPermissions={['module:sells', 'view:sells:clients', 'view:sells:quotes', 'view:sells:collections']} requireAny>
                  <Sells />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={routes.clients} 
              element={
                <ProtectedRoute requiredPermission="view:sells:clients">
                  <Clients />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={routes.createClient} 
              element={
                <ProtectedRoute requiredPermission="view:sells:clients">
                  <CreateClient />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={`${routes.clientDetails}/:id`} 
              element={
                <ProtectedRoute requiredPermission="view:sells:clients">
                  <ClientDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={routes.quotes} 
              element={
                <ProtectedRoute requiredPermission="view:sells:quotes">
                  <Quotes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={routes.createQuote} 
              element={
                <ProtectedRoute requiredPermission="view:sells:quotes">
                  <CreateQuote />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={`${routes.quoteDetails}/:id`} 
              element={
                <ProtectedRoute requiredPermission="view:sells:quotes">
                  <QuoteDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={routes.collections} 
              element={
                <ProtectedRoute requiredPermission="view:sells:collections">
                  <Collections />
                </ProtectedRoute>
              } 
            />
            
            {/* Rutas de Picking */}
            <Route 
              path={routes.picking} 
              element={
                <ProtectedRoute requiredPermissions={['module:picking', 'view:picking:order', 'view:picking:metrics', 'view:picking:warehouse']} requireAny>
                  <Picking />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={routes.pickingOrder} 
              element={
                <ProtectedRoute requiredPermission="view:picking:order">
                  <Picking />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={routes.pickingMetrics} 
              element={
                <ProtectedRoute requiredPermission="view:picking:metrics">
                  <Picking />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={routes.pickingWarehouse} 
              element={
                <ProtectedRoute requiredPermission="view:picking:warehouse">
                  <Picking />
                </ProtectedRoute>
              } 
            />
            
            {/* Rutas de Roles */}
            <Route 
              path={routes.rolesManagement} 
              element={
                <ProtectedRoute requiredPermission="view:roles:roles">
                  <RolesManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={routes.createRole} 
              element={
                <ProtectedRoute requiredPermission="view:roles:roles">
                  <CreateRole />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={routes.users} 
              element={
                <ProtectedRoute requiredPermission="view:roles:users">
                  <UsersManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={routes.createUser} 
              element={
                <ProtectedRoute requiredPermission="view:roles:users">
                  <CreateUser />
                </ProtectedRoute>
              } 
            />
            
            {/* Rutas de Productos */}
            <Route 
              path={routes.productsSearch} 
              element={
                <ProtectedRoute requiredPermission="view:products:search">
                  <SearchProducts />
                </ProtectedRoute>
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
            
            {/* Rutas legacy (sin protección por ahora) */}
            <Route path={routes.articles} element={<Articles />} />
            <Route path={routes.opportunities} element={<Opportunities />} />
            <Route path={routes.components} element={<Components />} />
            <Route path={routes.salesOrder} element={<SalesOrder />} />
            <Route path={routes.analytics} element={<Analytics />} />
            <Route path={routes.invoices} element={<Invoices />} />
            <Route path={routes.permissions} element={<PermissionsManagement />} />
          </Routes>
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
