import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { routes } from './routes';

/**
 * Componente principal de la aplicación cliente
 * @returns Componente App
 */
function App(): React.ReactNode {
  return (
    <div className="w-screen h-screen bg-blue-50/50 flex">
      <Sidebar />
      <div className="w-full h-full rounded-lg shadow-sm overflow-auto">
        <Routes>
          <Route path={routes.home} element={<div>Home</div>} />
        </Routes>
      </div>
    </div>
  );
}

export default App
