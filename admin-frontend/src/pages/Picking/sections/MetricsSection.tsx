import { useState } from 'react';

/**
 * Interfaz para las métricas de picking
 */
interface PickingMetrics {
  totalOrdenes: number;
  ordenesNotaVentaEmitida: number;
  ordenesPicking: number;
  ordenesConfirmacion: number;
  ordenesDespachadas: number;
  tiempoPromedioPicking: number; // en minutos
  eficiencia: number; // porcentaje
  ordenesHoy: number;
}

/**
 * Componente de sección de Métricas de Picking
 * @returns Componente MetricsSection
 */
export const MetricsSection = (): React.ReactElement => {
  // Datos de ejemplo - En producción esto vendría de un hook/API y eventualmente WebSocket
  const [metrics, setMetrics] = useState<PickingMetrics>({
    totalOrdenes: 127,
    ordenesNotaVentaEmitida: 15,
    ordenesPicking: 8,
    ordenesConfirmacion: 5,
    ordenesDespachadas: 99,
    tiempoPromedioPicking: 45,
    eficiencia: 87.5,
    ordenesHoy: 23
  });

  /**
   * Formatea el tiempo en minutos a formato legible
   */
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Métricas de Picking</h3>

        {/* Grid de métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total de órdenes */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Total de Órdenes</h4>
            <p className="text-3xl font-bold text-gray-900">{metrics.totalOrdenes.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">{metrics.ordenesHoy} hoy</p>
          </div>

          {/* Órdenes en Picking */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-500 mb-2">En Picking</h4>
            <p className="text-3xl font-bold text-blue-600">{metrics.ordenesPicking.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">
              {metrics.totalOrdenes > 0
                ? `${((metrics.ordenesPicking / metrics.totalOrdenes) * 100).toFixed(1)}% del total`
                : '0% del total'}
            </p>
          </div>

          {/* Órdenes Confirmadas */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Confirmadas</h4>
            <p className="text-3xl font-bold text-purple-600">{metrics.ordenesConfirmacion.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">Listas para despacho</p>
          </div>

          {/* Órdenes Despachadas */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Despachadas</h4>
            <p className="text-3xl font-bold text-green-600">{metrics.ordenesDespachadas.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">
              {metrics.totalOrdenes > 0
                ? `${((metrics.ordenesDespachadas / metrics.totalOrdenes) * 100).toFixed(1)}% completadas`
                : '0% completadas'}
            </p>
          </div>
        </div>

        {/* Grid de métricas secundarias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Nota de venta emitida */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Nota de Venta Emitida</h4>
            <p className="text-3xl font-bold text-yellow-600">{metrics.ordenesNotaVentaEmitida.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">Pendientes de picking</p>
          </div>

          {/* Tiempo promedio */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Tiempo Promedio</h4>
            <p className="text-3xl font-bold text-indigo-600">{formatTime(metrics.tiempoPromedioPicking)}</p>
            <p className="text-xs text-gray-500 mt-2">Por orden de picking</p>
          </div>

          {/* Eficiencia */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Eficiencia</h4>
            <p className="text-3xl font-bold text-emerald-600">{metrics.eficiencia.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-2">Tasa de completitud</p>
          </div>
        </div>

        {/* Nota sobre actualización en tiempo real */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Nota:</span> Estas métricas se actualizarán en tiempo real mediante WebSocket cuando se implemente la funcionalidad.
          </p>
        </div>
      </div>
    </div>
  );
};

