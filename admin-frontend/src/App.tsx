import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { routes } from './routes';
import { Home } from './pages/Home';
import { Articles } from './pages/Articles';
import { Opportunities } from './pages/Opportunities';
import { Sells } from './pages/Sells';
import { Clients } from './pages/Clients';
import { Quotes } from './pages/Quotes';
import { SalesOrder } from './pages/SalesOrder';

/**
 * Componente principal de la aplicación admin
 * @returns Componente App
 */
function App(): React.ReactNode {
  return (
    <div className="w-screen h-screen bg-blue-50/70 flex gap-4">
      <Sidebar />
      <div className="w-full h-full bg-white rounded-lg shadow-sm overflow-auto">
        <Routes>
          <Route path={routes.home} element={<Home />} />
          <Route path={routes.articles} element={<Articles />} />
          <Route path={routes.opportunities} element={<Opportunities />} />
          <Route path={routes.sells} element={<Sells />} />
          <Route path={routes.clients} element={<Clients />} />
          <Route path={routes.quotes} element={<Quotes />} />
          <Route path={routes.salesOrder} element={<SalesOrder />} />
        </Routes>
      </div>
    </div>
  );
}

export default App
