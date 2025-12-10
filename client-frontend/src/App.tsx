import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { routes } from './routes';
import { Inicio } from './pages/Inicio';
import Productos from './pages/Productos/Productos';
import Carrito from './pages/Carrito/Carrito';
import Pedidos from './pages/Pedidos/Pedidos';
import Facturas from './pages/Facturas/Facturas';
import Contacto from './pages/Contacto/Contacto';
import Metricas from './pages/Metricas/Metricas';
import { Capacitaciones } from './pages/Capacitaciones';
import { Reclamos } from './pages/Reclamos';

/**
 * Componente principal de la aplicación cliente
 * @returns Componente App
 */
function App(): React.ReactNode {
  return (
    <div className="w-screen h-screen bg-blue-50/50 flex">
      <Sidebar />
      <div className="w-full h-full overflow-auto">
        <Routes>
          <Route path={routes.home} element={<Inicio />} />
          <Route path={routes.productos} element={<Productos />} />
          <Route path={routes.carrito} element={<Carrito />} />
          <Route path={routes.pedidos} element={<Pedidos />} />
          <Route path={routes.facturas} element={<Facturas />} />
          <Route path={routes.contacto} element={<Contacto />} />
          <Route path={routes.metricas} element={<Metricas />} />
          <Route path={routes.capacitaciones} element={<Capacitaciones />} />
          <Route path={routes.reclamos} element={<Reclamos />} />
        </Routes>
      </div>
    </div>
  );
}

export default App
