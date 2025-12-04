import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Sidebar } from './components/Sidebar';
import { routes } from './routes';

const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Articles = lazy(() => import('./pages/Articles').then(module => ({ default: module.Articles })));
const Opportunities = lazy(() => import('./pages/Opportunities').then(module => ({ default: module.Opportunities })));
const Components = lazy(() => import('./pages/Components').then(module => ({ default: module.Components })));
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
    <div className="w-screen h-screen bg-blue-50/50 flex">
      <Sidebar />
      <div className="w-full h-full rounded-lg shadow-sm overflow-auto">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path={routes.home} element={<Home />} />
            <Route path={routes.articles} element={<Articles />} />
            <Route path={routes.opportunities} element={<Opportunities />} />
            <Route path={routes.components} element={<Components />} />
            <Route path={routes.sells} element={<Sells />} />
            <Route path={routes.clients} element={<Clients />} />
            <Route path={routes.createClient} element={<CreateClient />} />
            <Route path={`${routes.clientDetails}/:id`} element={<ClientDetails />} />
            <Route path={routes.quotes} element={<Quotes />} />
            <Route path={routes.createQuote} element={<CreateQuote />} />
            <Route path={`${routes.quoteDetails}/:id`} element={<QuoteDetails />} />
            <Route path={routes.salesOrder} element={<SalesOrder />} />
            <Route path={routes.collections} element={<Collections />} />
            <Route path={routes.picking} element={<Picking />} />
            <Route path={routes.pickingOrder} element={<Picking />} />
            <Route path={routes.pickingMetrics} element={<Picking />} />
            <Route path={routes.analytics} element={<Analytics />} />
            <Route path={routes.chat} element={<Chat />} />
            <Route path={routes.support} element={<Support />} />
            <Route path={routes.invoices} element={<Invoices />} />
            <Route path={routes.rolesManagement} element={<RolesManagement />} />
            <Route path={routes.createRole} element={<CreateRole />} />
            <Route path={routes.permissions} element={<PermissionsManagement />} />
            <Route path={routes.users} element={<UsersManagement />} />
            <Route path={routes.createUser} element={<CreateUser />} />
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
  );
}

export default App
