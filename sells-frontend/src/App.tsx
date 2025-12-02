import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components';

/**
 * Página principal de la aplicación
 * @returns Componente de página principal
 */
function HomePage(): React.ReactElement {
  return (
    <Layout>
      <div className="py-4 sm:py-6 md:py-8 lg:py-10">
        <h1 className="heading-responsive font-bold text-gray-900">
          Sells Frontend
        </h1>
      </div>
    </Layout>
  );
}

/**
 * Componente principal de la aplicación
 * @returns Componente App
 */
function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
