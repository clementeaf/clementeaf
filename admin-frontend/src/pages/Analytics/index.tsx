import { useState } from 'react';
import {
  useEstadisticas,
  useResumenClientes,
  useResumenVendedores,
  useDeudasActivas
} from '../../hooks/useAnalytics';

export const Analytics = () => {
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data: estadisticas, isLoading: loadingStats } = useEstadisticas();
  const { data: topClientes, isLoading: loadingClientes } = useResumenClientes(10);
  const { data: topVendedores, isLoading: loadingVendedores } = useResumenVendedores(10);
  const { data: deudasActivas, isLoading: loadingDeudas } = useDeudasActivas({ page, limit });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  if (loadingStats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Cargando estadísticas...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Analytics - Cuentas por Cobrar</h1>
        {estadisticas && (
          <div className="text-sm text-gray-500">
            Última sincronización: {formatDate(estadisticas.ultima_sincronizacion)}
          </div>
        )}
      </div>

      {/* Estadísticas Generales */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Documentos</h3>
            <p className="text-2xl font-bold text-gray-900">{estadisticas.total_documentos.toLocaleString()}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Deuda Total</h3>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(estadisticas.deuda_total)}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Documentos Activos</h3>
            <p className="text-2xl font-bold text-blue-600">{estadisticas.documentos_activos.toLocaleString()}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Documentos Vencidos</h3>
            <p className="text-2xl font-bold text-orange-600">{estadisticas.documentos_vencidos.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clientes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Top 10 Clientes por Deuda</h2>
          {loadingClientes ? (
            <div>Cargando...</div>
          ) : (
            <div className="space-y-2">
              {topClientes?.map((cliente, index) => (
                <div key={cliente.rut} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-gray-400 w-6">{index + 1}</span>
                    <div>
                      <p className="font-medium text-gray-900">{cliente.razsoc}</p>
                      <p className="text-xs text-gray-500">RUT: {cliente.rut} | {cliente.total_documentos} docs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{formatCurrency(cliente.deuda_total)}</p>
                    <p className="text-xs text-gray-500">Promedio: {cliente.promedio_dias_vencidos.toFixed(0)} días</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Vendedores */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Top 10 Vendedores por Deuda</h2>
          {loadingVendedores ? (
            <div>Cargando...</div>
          ) : (
            <div className="space-y-2">
              {topVendedores?.map((vendedor, index) => (
                <div key={vendedor.codvend} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-gray-400 w-6">{index + 1}</span>
                    <div>
                      <p className="font-medium text-gray-900">{vendedor.nombre_vendedor}</p>
                      <p className="text-xs text-gray-500">
                        {vendedor.team} | {vendedor.total_documentos} docs | {vendedor.documentos_vencidos} vencidos
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-blue-600">{formatCurrency(vendedor.deuda_total)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabla de Deudas Activas */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Deudas Activas</h2>
        {loadingDeudas ? (
          <div>Cargando...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendedor</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deuda</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Vencimiento</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Días</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deudasActivas?.data.map((deuda) => (
                    <tr key={`${deuda.td}-${deuda.numdocto}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div>
                          <p className="font-medium">{deuda.td} {deuda.numdocto}</p>
                          <p className="text-xs text-gray-500">{deuda.numordenc}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <p className="font-medium">{deuda.razsoc}</p>
                          <p className="text-xs text-gray-500">{deuda.rut}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <p>{deuda.nombre_vendedor}</p>
                          <p className="text-xs text-gray-500">{deuda.team}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                        {formatCurrency(deuda.deuda || 0)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        {deuda.vencimiento ? formatDate(deuda.vencimiento) : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        <span className={`px-2 py-1 rounded ${
                          (deuda.dias_vencidos || 0) > 0 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {deuda.dias_vencidos} días
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {deudasActivas && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, deudasActivas.total)} de {deudasActivas.total} resultados
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                  <span className="px-4 py-2">
                    Página {page} de {deudasActivas.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(deudasActivas.totalPages, p + 1))}
                    disabled={page === deudasActivas.totalPages}
                    className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
