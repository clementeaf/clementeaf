import React, { useState, useMemo } from 'react';
import { ReusableLineChart } from '../components/ReusableLineChart';
import { usePickingMetrics } from '../../../hooks/usePickingMetrics';


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
 * Interfaz para los datos del gráfico de picking ejecutados
 */
interface PickingEjecutadoChartData extends Record<string, string | number | undefined> {
  periodo: string; // Día, Semana o Mes según la temporalidad seleccionada
  cantidad: number; // Cantidad de pickings ejecutados
  operador?: string; // Nombre del operador que ejecutó el picking
  horaEjecucion?: string; // Hora de ejecución del picking
}

/**
 * Interfaz para los datos del gráfico de órdenes despachadas
 */
interface OrdenDespachadaChartData extends Record<string, string | number | undefined> {
  periodo: string; // Día, Semana o Mes según la temporalidad seleccionada
  cantidad: number; // Cantidad de órdenes despachadas
  conductor?: string; // Nombre del conductor que realizó el despacho
  horaDespacho?: string; // Hora de despacho/salida a ruta
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
 * Interfaz para los datos históricos de las métricas
 */
interface PickingMetricsHistory {
  diaAnterior: PickingMetrics;
  semanaAnterior: PickingMetrics;
  mesAnterior: PickingMetrics;
}

/**
 * Componente de sección de Métricas de Picking
 * @returns Componente MetricsSection
 */

export const MetricsSection = (): React.ReactElement => {
  const [temporalidad, setTemporalidad] = useState<Temporalidad>('Día');
  
  // Obtener métricas desde la API con actualización en tiempo real
  const { data: metricsData, isLoading, refetch } = usePickingMetrics({ temporalidad });

  // Refrescar métricas cuando cambia la temporalidad
  React.useEffect(() => {
    refetch();
  }, [temporalidad, refetch]);

  // Extraer métricas y datos históricos
  const metrics = metricsData?.metrics || {
    totalOrdenes: 0,
    ordenesNotaVentaEmitida: 0,
    ordenesPicking: 0,
    ordenesConfirmacion: 0,
    ordenesDespachadas: 0,
    tiempoPromedioPicking: 0,
    eficiencia: 0,
    ordenesHoy: 0
  };

  const metricsHistory: PickingMetricsHistory = metricsData?.metricsHistory || {
    diaAnterior: {
      totalOrdenes: 0,
      ordenesNotaVentaEmitida: 0,
      ordenesPicking: 0,
      ordenesConfirmacion: 0,
      ordenesDespachadas: 0,
      tiempoPromedioPicking: 0,
      eficiencia: 0,
      ordenesHoy: 0
    },
    semanaAnterior: {
      totalOrdenes: 0,
      ordenesNotaVentaEmitida: 0,
      ordenesPicking: 0,
      ordenesConfirmacion: 0,
      ordenesDespachadas: 0,
      tiempoPromedioPicking: 0,
      eficiencia: 0,
      ordenesHoy: 0
    },
    mesAnterior: {
      totalOrdenes: 0,
      ordenesNotaVentaEmitida: 0,
      ordenesPicking: 0,
      ordenesConfirmacion: 0,
      ordenesDespachadas: 0,
      tiempoPromedioPicking: 0,
      eficiencia: 0,
      ordenesHoy: 0
    }
  };

  // Datos de gráficos desde la API
  const chartData = useMemo<NotaVentaChartData[]>(() => {
    return metricsData?.chartData.notasVenta.map(item => ({
      periodo: item.periodo,
      cantidad: item.cantidad,
      vendedor: item.vendedor,
      horaEmision: item.horaEmision
    })) || [];
  }, [metricsData]);

  const pickingChartData = useMemo<PickingEjecutadoChartData[]>(() => {
    return metricsData?.chartData.pickingEjecutado.map(item => ({
      periodo: item.periodo,
      cantidad: item.cantidad,
      operador: item.vendedor,
      horaEjecucion: item.horaEmision
    })) || [];
  }, [metricsData]);

  const ordenesDespachadasChartData = useMemo<OrdenDespachadaChartData[]>(() => {
    return metricsData?.chartData.ordenesDespachadas.map(item => ({
      periodo: item.periodo,
      cantidad: item.cantidad,
      conductor: item.vendedor,
      horaDespacho: item.horaEmision
    })) || [];
  }, [metricsData]);


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

  /**
   * Calcula la variación porcentual entre dos valores
   * @param valorActual - Valor actual
   * @param valorAnterior - Valor anterior
   * @returns Porcentaje de variación (positivo o negativo)
   */
  const calcularVariacion = (valorActual: number, valorAnterior: number): number => {
    if (valorAnterior === 0) {
      return valorActual > 0 ? 100 : 0;
    }
    return ((valorActual - valorAnterior) / valorAnterior) * 100;
  };

  /**
   * Obtiene el valor histórico según la temporalidad seleccionada
   * @param key - Clave de la métrica
   * @returns Valor histórico correspondiente
   */
  const obtenerValorHistorico = (key: keyof PickingMetrics): number => {
    switch (temporalidad) {
      case 'Día':
        return metricsHistory.diaAnterior[key];
      case 'Semana':
        return metricsHistory.semanaAnterior[key];
      case 'Mes':
        return metricsHistory.mesAnterior[key];
      default:
        return metricsHistory.diaAnterior[key];
    }
  };

  /**
   * Obtiene la variación porcentual para una métrica específica
   * @param key - Clave de la métrica
   * @returns Porcentaje de variación
   */
  const obtenerVariacion = (key: keyof PickingMetrics): number => {
    const valorActual = metrics[key];
    const valorAnterior = obtenerValorHistorico(key);
    return calcularVariacion(valorActual, valorAnterior);
  };

  /**
   * Renderiza el porcentaje de variación con el color correspondiente
   * @param variacion - Porcentaje de variación
   * @param invertirColores - Si es true, invierte los colores (útil para métricas donde menos es mejor)
   * @returns Elemento React con el porcentaje formateado
   */
  const renderizarVariacion = (variacion: number, invertirColores = false): React.ReactElement => {
    const esPositivo = variacion > 0;
    const esNegativo = variacion < 0;
    let color: string;
    
    if (invertirColores) {
      // Para métricas donde menos es mejor (ej: tiempo promedio)
      color = esPositivo ? 'text-red-600' : esNegativo ? 'text-green-600' : 'text-gray-500';
    } else {
      // Para métricas donde más es mejor
      color = esPositivo ? 'text-green-600' : esNegativo ? 'text-red-600' : 'text-gray-500';
    }
    
    const signo = esPositivo ? '+' : '';
    const valorFormateado = `${signo}${variacion.toFixed(1)}%`;
    
    return (
      <span className={`text-[9px] font-medium ${color}`}>
        {valorFormateado}
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">Métricas de Picking</h3>
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

        {/* Métricas en una sola línea */}
        <div className="flex gap-6 mb-6">
          {/* Total de órdenes */}
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex-1">
            <h4 className="text-[10px] font-medium text-gray-500 mb-1">Total de Órdenes</h4>
            <p className="text-xl font-bold text-gray-900">{metrics.totalOrdenes.toLocaleString()}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[9px] text-gray-500">{metrics.ordenesHoy} hoy</p>
              {renderizarVariacion(obtenerVariacion('totalOrdenes'))}
            </div>
          </div>

          {/* Órdenes en Picking */}
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex-1">
            <h4 className="text-[10px] font-medium text-gray-500 mb-1">En Picking</h4>
            <p className="text-xl font-bold text-blue-600">{metrics.ordenesPicking.toLocaleString()}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[9px] text-gray-500">
                {metrics.totalOrdenes > 0
                  ? `${((metrics.ordenesPicking / metrics.totalOrdenes) * 100).toFixed(1)}% del total`
                  : '0% del total'}
              </p>
              {renderizarVariacion(obtenerVariacion('ordenesPicking'))}
            </div>
          </div>

          {/* Órdenes Confirmadas */}
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex-1">
            <h4 className="text-[10px] font-medium text-gray-500 mb-1">Confirmadas</h4>
            <p className="text-xl font-bold text-purple-600">{metrics.ordenesConfirmacion.toLocaleString()}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[9px] text-gray-500">Listas para despacho</p>
              {renderizarVariacion(obtenerVariacion('ordenesConfirmacion'))}
            </div>
          </div>

          {/* Órdenes Despachadas */}
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex-1">
            <h4 className="text-[10px] font-medium text-gray-500 mb-1">Despachadas</h4>
            <p className="text-xl font-bold text-green-600">{metrics.ordenesDespachadas.toLocaleString()}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[9px] text-gray-500">
                {metrics.totalOrdenes > 0
                  ? `${((metrics.ordenesDespachadas / metrics.totalOrdenes) * 100).toFixed(1)}% completadas`
                  : '0% completadas'}
              </p>
              {renderizarVariacion(obtenerVariacion('ordenesDespachadas'))}
            </div>
          </div>

          {/* Nota de venta emitida */}
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex-1">
            <h4 className="text-[10px] font-medium text-gray-500 mb-1">Nota de Venta Emitida</h4>
            <p className="text-xl font-bold text-yellow-600">{metrics.ordenesNotaVentaEmitida.toLocaleString()}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[9px] text-gray-500">Pendientes de picking</p>
              {renderizarVariacion(obtenerVariacion('ordenesNotaVentaEmitida'))}
            </div>
          </div>

          {/* Tiempo promedio */}
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex-1">
            <h4 className="text-[10px] font-medium text-gray-500 mb-1">Tiempo Promedio</h4>
            <p className="text-xl font-bold text-indigo-600">{formatTime(metrics.tiempoPromedioPicking)}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[9px] text-gray-500">Por orden de picking</p>
              {renderizarVariacion(obtenerVariacion('tiempoPromedioPicking'), true)}
            </div>
          </div>

          {/* Eficiencia */}
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex-1">
            <h4 className="text-[10px] font-medium text-gray-500 mb-1">Eficiencia</h4>
            <p className="text-xl font-bold text-emerald-600">{metrics.eficiencia.toFixed(1)}%</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[9px] text-gray-500">Tasa de completitud</p>
              {renderizarVariacion(obtenerVariacion('eficiencia'))}
            </div>
          </div>
        </div>

        {/* Contenedor de gráficos lado a lado */}
        <div className="flex gap-6 mb-6">
          {/* Gráfico de Notas de Ventas Emitidas */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 w-[528px] flex flex-col items-center">
            <div className="w-full mb-4">
              <p className="text-[12px] font-bold text-gray-800">Notas de ventas emitidas</p>
            </div>
            {/* Gráfico de Notas de Ventas Emitidas */}
            <ReusableLineChart
              data={chartData}
              xAxisDataKey="periodo"
              yAxisDataKey="cantidad"
              xAxisLabel="Fecha"
              yAxisLabel="Cantidad de notas de ventas"
              width={480}
              height={200}
              yAxisMin={0}
              yAxisMax={Math.max(10, ...chartData.map(d => d.cantidad || 0)) || 10}
            />
          </div>

          {/* Gráfico de Picking Ejecutados */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 w-[528px] flex flex-col items-center">
            <div className="w-full mb-4">
              <p className="text-[12px] font-bold text-gray-800">Picking ejecutados</p>
            </div>
            {/* Gráfico de Picking Ejecutados */}
            <ReusableLineChart
              data={pickingChartData}
              xAxisDataKey="periodo"
              yAxisDataKey="cantidad"
              xAxisLabel="Fecha"
              yAxisLabel="Cantidad de pickings ejecutados"
              width={480}
              height={200}
              yAxisMin={0}
              yAxisMax={Math.max(10, ...pickingChartData.map(d => d.cantidad || 0)) || 10}
            />
          </div>

          {/* Gráfico de Órdenes Despachadas */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 w-[528px] flex flex-col items-center">
            <div className="w-full mb-4">
              <p className="text-[12px] font-bold text-gray-800">Órdenes Despachadas</p>
            </div>
            {/* Gráfico de Órdenes Despachadas */}
            <ReusableLineChart
              data={ordenesDespachadasChartData}
              xAxisDataKey="periodo"
              yAxisDataKey="cantidad"
              xAxisLabel="Fecha"
              yAxisLabel="Cantidad de órdenes despachadas"
              width={480}
              height={200}
              yAxisMin={0}
              yAxisMax={Math.max(10, ...ordenesDespachadasChartData.map(d => d.cantidad || 0)) || 10}
            />
          </div>
        </div>

        {isLoading && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0052C9]"></div>
          </div>
        )}
      </div>
    </div>
  );
};

