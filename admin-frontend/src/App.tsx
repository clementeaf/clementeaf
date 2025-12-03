import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Sidebar } from './components/Sidebar';
import { routes } from './routes';
import { Home } from './pages/Home';
import { Articles } from './pages/Articles';
import { Opportunities } from './pages/Opportunities';
import { Components } from './pages/Components';
import { Sells } from './pages/Sells';
import { Clients } from './pages/Clients';
import { CreateClient } from './pages/Clients/CreateClient';
import { ClientDetails } from './pages/Clients/ClientDetails/ClientDetails';
import { Quotes } from './pages/Quotes';
import { CreateQuote } from './pages/Quotes/CreateQuote';
import { QuoteDetails } from './pages/Quotes/QuoteDetails/QuoteDetails';
import { SalesOrder } from './pages/SalesOrder';
import { Collections } from './pages/Collections';
import { Picking } from './pages/Picking';
import { Analytics } from './pages/Analytics';
import { Chat } from './pages/Chat';
import { Support } from './pages/Support';
import { Invoices } from './pages/Invoices';

/**
 * Componente principal de la aplicación admin
 * @returns Componente App
 */
function App(): React.ReactNode {
  return (
    <div className="w-screen h-screen bg-blue-50/50 flex">
      <Sidebar />
      <div className="w-full h-full rounded-lg shadow-sm overflow-auto">
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
          <Route path={routes.pickingHistory} element={<Picking />} />
          <Route path={routes.pickingReports} element={<Picking />} />
          <Route path={routes.pickingMetrics} element={<Picking />} />
          <Route path={routes.analytics} element={<Analytics />} />
          <Route path={routes.chat} element={<Chat />} />
          <Route path={routes.support} element={<Support />} />
          <Route path={routes.invoices} element={<Invoices />} />
        </Routes>
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
