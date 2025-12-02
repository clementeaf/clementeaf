import { Layout } from './components';

/**
 * Componente principal de la aplicación
 * @returns Componente App
 */
function App(): React.ReactElement {
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

export default App;
