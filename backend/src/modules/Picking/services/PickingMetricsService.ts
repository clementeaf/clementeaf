import { AppDataSource } from '../../../config/database';
import { Quote } from '../../Quotes/entities/Quote.entity';

/**
 * Interfaz para métricas de picking
 */
export interface PickingMetrics {
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
 * Interfaz para datos de gráfico
 */
export interface ChartDataPoint {
  periodo: string;
  cantidad: number;
  vendedor?: string;
  horaEmision?: string;
}

/**
 * Servicio para calcular métricas de picking
 */
export class PickingMetricsService {
  private get quoteRepository() {
    return AppDataSource.getRepository(Quote);
  }

  /**
   * Mapea el estado de Quote a estado de Picking
   * @param estado - Estado de la Quote
   * @returns Estado de Picking correspondiente
   */
  private mapQuoteEstadoToPickingEstado(estado: string): 'Nota de venta emitida' | 'Picking' | 'Confirmación' | 'Despachado' {
    // Mapeo de estados: por ahora, todas las quotes enviadas son "Nota de venta emitida"
    // En el futuro, esto podría basarse en un campo adicional o lógica de negocio
    if (estado === 'enviada' || estado === 'aceptada') {
      return 'Nota de venta emitida';
    }
    // Por defecto, asumimos que es "Nota de venta emitida"
    return 'Nota de venta emitida';
  }

  /**
   * Obtiene métricas actuales de picking
   * @param _temporalidad - Temporalidad para comparación ('Día', 'Semana', 'Mes') - No se usa actualmente
   * @returns Métricas actuales
   */
  async getCurrentMetrics(_temporalidad: 'Día' | 'Semana' | 'Mes' = 'Día'): Promise<PickingMetrics> {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Obtener todas las quotes
    const allQuotes = await this.quoteRepository.find({
      order: { createdAt: 'DESC' }
    });

    // Contar por estado de picking
    let ordenesNotaVentaEmitida = 0;
    let ordenesPicking = 0;
    let ordenesConfirmacion = 0;
    let ordenesDespachadas = 0;
    let ordenesHoy = 0;

    allQuotes.forEach(quote => {
      const pickingEstado = this.mapQuoteEstadoToPickingEstado(quote.estado);
      
      switch (pickingEstado) {
        case 'Nota de venta emitida':
          ordenesNotaVentaEmitida++;
          break;
        case 'Picking':
          ordenesPicking++;
          break;
        case 'Confirmación':
          ordenesConfirmacion++;
          break;
        case 'Despachado':
          ordenesDespachadas++;
          break;
      }

      // Contar órdenes de hoy
      if (quote.createdAt && new Date(quote.createdAt) >= startOfToday) {
        ordenesHoy++;
      }
    });

    const totalOrdenes = allQuotes.length;

    // Calcular tiempo promedio (simulado por ahora, en producción se calcularía desde timestamps reales)
    const tiempoPromedioPicking = totalOrdenes > 0 ? 45 : 0; // 45 minutos promedio

    // Calcular eficiencia (porcentaje de órdenes completadas)
    const eficiencia = totalOrdenes > 0 
      ? ((ordenesDespachadas / totalOrdenes) * 100) 
      : 0;

    return {
      totalOrdenes,
      ordenesNotaVentaEmitida,
      ordenesPicking,
      ordenesConfirmacion,
      ordenesDespachadas,
      tiempoPromedioPicking,
      eficiencia,
      ordenesHoy
    };
  }

  /**
   * Obtiene métricas históricas para comparación
   * @param temporalidad - Temporalidad para comparación
   * @returns Métricas históricas
   */
  async getHistoricalMetrics(temporalidad: 'Día' | 'Semana' | 'Mes'): Promise<PickingMetrics> {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (temporalidad) {
      case 'Día':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'Semana':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case 'Mes':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
    }

    const quotes = await this.quoteRepository
      .createQueryBuilder('quote')
      .where('quote.createdAt >= :startDate', { startDate })
      .andWhere('quote.createdAt < :endDate', { endDate })
      .getMany();

    // Calcular métricas históricas (simplificado)
    return {
      totalOrdenes: quotes.length,
      ordenesNotaVentaEmitida: quotes.filter(q => this.mapQuoteEstadoToPickingEstado(q.estado) === 'Nota de venta emitida').length,
      ordenesPicking: quotes.filter(q => this.mapQuoteEstadoToPickingEstado(q.estado) === 'Picking').length,
      ordenesConfirmacion: quotes.filter(q => this.mapQuoteEstadoToPickingEstado(q.estado) === 'Confirmación').length,
      ordenesDespachadas: quotes.filter(q => this.mapQuoteEstadoToPickingEstado(q.estado) === 'Despachado').length,
      tiempoPromedioPicking: 45,
      eficiencia: quotes.length > 0 ? (quotes.filter(q => this.mapQuoteEstadoToPickingEstado(q.estado) === 'Despachado').length / quotes.length) * 100 : 0,
      ordenesHoy: 0
    };
  }

  /**
   * Obtiene datos para el gráfico de notas de ventas emitidas
   * @param temporalidad - Temporalidad del gráfico
   * @returns Datos del gráfico
   */
  async getNotasVentaChartData(temporalidad: 'Día' | 'Semana' | 'Mes'): Promise<ChartDataPoint[]> {
    const now = new Date();
    let days: number;
    
    switch (temporalidad) {
      case 'Día':
        days = 7; // Últimos 7 días
        break;
      case 'Semana':
        days = 4; // Últimas 4 semanas
        break;
      case 'Mes':
        days = 6; // Últimos 6 meses
        break;
    }

    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const quotes = await this.quoteRepository
      .createQueryBuilder('quote')
      .where('quote.createdAt >= :startDate', { startDate })
      .orderBy('quote.createdAt', 'ASC')
      .getMany();

    // Agrupar por período según temporalidad
    const grouped: Record<string, number> = {};
    
    quotes.forEach(quote => {
      if (!quote.createdAt) return;
      
      const date = new Date(quote.createdAt);
      let key: string;
      
      switch (temporalidad) {
        case 'Día':
          key = date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
          break;
        case 'Semana':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `Sem ${weekStart.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' })}`;
          break;
        case 'Mes':
          key = date.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' });
          break;
      }
      
      grouped[key] = (grouped[key] || 0) + 1;
    });

    return Object.entries(grouped).map(([periodo, cantidad]) => ({
      periodo,
      cantidad
    }));
  }

  /**
   * Obtiene datos para el gráfico de picking ejecutados
   * @param temporalidad - Temporalidad del gráfico
   * @returns Datos del gráfico
   */
  async getPickingEjecutadoChartData(temporalidad: 'Día' | 'Semana' | 'Mes'): Promise<ChartDataPoint[]> {
    // Por ahora, usar los mismos datos que notas de venta (en producción sería diferente)
    return await this.getNotasVentaChartData(temporalidad);
  }

  /**
   * Obtiene datos para el gráfico de órdenes despachadas
   * @param temporalidad - Temporalidad del gráfico
   * @returns Datos del gráfico
   */
  async getOrdenesDespachadasChartData(temporalidad: 'Día' | 'Semana' | 'Mes'): Promise<ChartDataPoint[]> {
    // Por ahora, usar los mismos datos que notas de venta (en producción sería diferente)
    return await this.getNotasVentaChartData(temporalidad);
  }
}

