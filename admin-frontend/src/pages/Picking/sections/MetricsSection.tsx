import { useState, useMemo } from 'react';
import { ReusableLineChart } from '../components/ReusableLineChart';


/**
 * Tipo para la temporalidad del gráfico
 */
type Temporalidad = 'Día' | 'Semana' | 'Mes';

/**
 * Interfaz para los datos del gráfico de notas de ventas emitidas
 */
interface NotaVentaChartData extends Record<string, string | number | undefined> {
  periodo: string; // Día, Semana o Mes según la temporalidad seleccionada
  cantidad: number; // Cantidad de notas de ventas emitidas
  vendedor?: string; // Nombre del vendedor
  horaEmision?: string; // Hora de emisión de la nota de venta
}

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

  // Estado para la temporalidad seleccionada
  const [temporalidad, setTemporalidad] = useState<Temporalidad>('Día');

  // Datos del gráfico con un punto de hoy
  const chartData = useMemo<NotaVentaChartData[]>(() => {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    const fechaFormateada = `${dia}/${mes}/${anio}`;
    return [
      {
        periodo: fechaFormateada,
        cantidad: 1,
        vendedor: 'Clemente Arriagada',
        horaEmision: '08:45'
      }
    ];
  }, []);


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

        {/* Métricas en una sola línea */}
        <div className="flex gap-3 overflow-x-auto mb-6 pb-2">
          {/* Total de órdenes */}
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex-shrink-0 min-w-[140px]">
            <h4 className="text-[10px] font-medium text-gray-500 mb-1">Total de Órdenes</h4>
            <p className="text-xl font-bold text-gray-900">{metrics.totalOrdenes.toLocaleString()}</p>
            <p className="text-[9px] text-gray-500 mt-1">{metrics.ordenesHoy} hoy</p>
          </div>

          {/* Órdenes en Picking */}
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex-shrink-0 min-w-[140px]">
            <h4 className="text-[10px] font-medium text-gray-500 mb-1">En Picking</h4>
            <p className="text-xl font-bold text-blue-600">{metrics.ordenesPicking.toLocaleString()}</p>
            <p className="text-[9px] text-gray-500 mt-1">
              {metrics.totalOrdenes > 0
                ? `${((metrics.ordenesPicking / metrics.totalOrdenes) * 100).toFixed(1)}% del total`
                : '0% del total'}
            </p>
          </div>

          {/* Órdenes Confirmadas */}
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex-shrink-0 min-w-[140px]">
            <h4 className="text-[10px] font-medium text-gray-500 mb-1">Confirmadas</h4>
            <p className="text-xl font-bold text-purple-600">{metrics.ordenesConfirmacion.toLocaleString()}</p>
            <p className="text-[9px] text-gray-500 mt-1">Listas para despacho</p>
          </div>

          {/* Órdenes Despachadas */}
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex-shrink-0 min-w-[140px]">
            <h4 className="text-[10px] font-medium text-gray-500 mb-1">Despachadas</h4>
            <p className="text-xl font-bold text-green-600">{metrics.ordenesDespachadas.toLocaleString()}</p>
            <p className="text-[9px] text-gray-500 mt-1">
              {metrics.totalOrdenes > 0
                ? `${((metrics.ordenesDespachadas / metrics.totalOrdenes) * 100).toFixed(1)}% completadas`
                : '0% completadas'}
            </p>
          </div>

          {/* Nota de venta emitida */}
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex-shrink-0 min-w-[140px]">
            <h4 className="text-[10px] font-medium text-gray-500 mb-1">Nota de Venta Emitida</h4>
            <p className="text-xl font-bold text-yellow-600">{metrics.ordenesNotaVentaEmitida.toLocaleString()}</p>
            <p className="text-[9px] text-gray-500 mt-1">Pendientes de picking</p>
          </div>

          {/* Tiempo promedio */}
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex-shrink-0 min-w-[140px]">
            <h4 className="text-[10px] font-medium text-gray-500 mb-1">Tiempo Promedio</h4>
            <p className="text-xl font-bold text-indigo-600">{formatTime(metrics.tiempoPromedioPicking)}</p>
            <p className="text-[9px] text-gray-500 mt-1">Por orden de picking</p>
          </div>

          {/* Eficiencia */}
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex-shrink-0 min-w-[140px]">
            <h4 className="text-[10px] font-medium text-gray-500 mb-1">Eficiencia</h4>
            <p className="text-xl font-bold text-emerald-600">{metrics.eficiencia.toFixed(1)}%</p>
            <p className="text-[9px] text-gray-500 mt-1">Tasa de completitud</p>
          </div>
        </div>

        {/* Gráfico de Notas de Ventas Emitidas */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 w-[300px] flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-4">
            <p className="text-[12px] font-bold text-gray-800">Notas de ventas emitidas</p>
            {/* Viñetas de temporalidad */}
            <div className="flex gap-2">
              {(['Día', 'Semana', 'Mes'] as Temporalidad[]).map((temp) => (
                <button
                  key={temp}
                  onClick={() => setTemporalidad(temp)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                    temporalidad === temp
                      ? 'bg-[#0052C9] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {temp}
                </button>
              ))}
            </div>
          </div>
          {/* Gráfico de Notas de Ventas Emitidas */}
          <ReusableLineChart
            data={chartData}
            xAxisDataKey="periodo"
            yAxisDataKey="cantidad"
            xAxisLabel="Fecha"
            yAxisLabel="Cantidad de notas de ventas"
            width={250}
            height={200}
          />
        </div>

        {/* Nota sobre actualización en tiempo real */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Nota:</span> Estas métricas se actualizarán en tiempo real mediante WebSocket cuando se implemente la funcionalidad.
          </p>
        </div>
      </div>
    </div>
  );
};

