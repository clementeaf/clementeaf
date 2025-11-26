import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../routes';

/**
 * Página de crear cotización
 * @returns Componente CreateQuote
 */
export const CreateQuote = () => {
  const navigate = useNavigate();
  const [currentStep] = useState(1);

  return (
    <div className="w-full h-full flex">
      <div className="border-r border-gray-200 w-[15%] h-full flex flex-col items-center pr-5">
        <div className="w-full pt-6">
          <h1 className="text-xl font-bold text-gray-800 mb-2">Crear cotización</h1>
          <div className="text-sm text-gray-500 mb-6">
            <span>Clientes</span>
            <span className="mx-2">›</span>
            <span>Crear cotización</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                1
              </div>
              <span className="text-blue-600 font-medium">Paso 1 Cliente</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                2
              </div>
              <span className="text-gray-600">Paso 2 Condiciones</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                3
              </div>
              <span className="text-gray-600">Paso 3 Productos</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                4
              </div>
              <span className="text-gray-600">Paso 4 Revisión</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Información del cliente</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del cliente</label>
            <input
              type="text"
              placeholder="Busca o selecciona un cliente existente"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dirección de facturación</label>
            <input
              type="text"
              placeholder="Av. Domingo Santa María 1946, Independencia"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => navigate(routes.clients)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Siguiente &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

