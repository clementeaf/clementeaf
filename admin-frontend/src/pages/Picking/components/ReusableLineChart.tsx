import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
  type TooltipItem
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

/**
 * Props del componente ReusableLineChart
 */
interface ReusableLineChartProps {
  /**
   * Datos del gráfico
   */
  data: Record<string, string | number | undefined>[];
  /**
   * Clave de datos para el eje X
   */
  xAxisDataKey: string;
  /**
   * Clave de datos para el eje Y (línea)
   */
  yAxisDataKey: string;
  /**
   * Etiqueta del eje X
   */
  xAxisLabel?: string;
  /**
   * Etiqueta del eje Y
   */
  yAxisLabel?: string;
  /**
   * Ancho del contenedor responsivo
   */
  width?: number;
  /**
   * Alto del contenedor responsivo
   */
  height?: number;
  /**
   * Valor mínimo del eje Y
   */
  yAxisMin?: number;
  /**
   * Valor máximo del eje Y
   */
  yAxisMax?: number;
  /**
   * Función personalizada para renderizar el tooltip
   */
  customTooltip?: (context: {
    label: string | number;
    data: Record<string, string | number | undefined>;
  }) => string | string[];
}

/**
 * Componente reutilizable de gráfico de líneas usando Chart.js
 * @param props - Propiedades del componente
 * @returns Componente ReusableLineChart
 */
export const ReusableLineChart = ({
  data,
  xAxisDataKey,
  yAxisDataKey,
  xAxisLabel,
  yAxisLabel,
  width = 250,
  height = 200,
  yAxisMin,
  yAxisMax,
  customTooltip
}: ReusableLineChartProps): React.ReactElement => {
  const chartData = {
    labels: data.map((item) => String(item[xAxisDataKey] ?? '')),
    datasets: [
      {
        label: yAxisLabel ?? 'Valor',
        data: data.map((item) => Number(item[yAxisDataKey] ?? 0)),
        borderColor: '#0052C9',
        backgroundColor: 'rgba(0, 82, 201, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#0052C9',
        pointBorderColor: '#0052C9',
        fill: false,
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'point' as const
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        intersect: true,
        callbacks: {
          title: (context: TooltipItem<'line'>[]): string => {
            return String(context[0]?.label ?? '');
          },
          label: (context: TooltipItem<'line'>): string | string[] => {
            const dataPoint = data[context.dataIndex ?? 0];
            if (customTooltip && dataPoint) {
              return customTooltip({
                label: String(context.label ?? ''),
                data: dataPoint
              });
            }
            const yValue = context.parsed.y ?? 0;
            return `${yAxisLabel ?? 'Valor'}: ${yValue}`;
          },
          afterBody: (context: TooltipItem<'line'>[]): string[] => {
            const dataPoint = data[context[0]?.dataIndex ?? 0];
            if (!dataPoint) {
              return [];
            }
            const lines: string[] = [];
            // Detectar si es un gráfico de notas de ventas, picking ejecutados o órdenes despachadas
            if (dataPoint.vendedor) {
              lines.push(`Vendedor: ${String(dataPoint.vendedor)}`);
            }
            if (dataPoint.horaEmision) {
              lines.push(`Hora de emisión N.V: ${String(dataPoint.horaEmision)}`);
            }
            if (dataPoint.operador) {
              lines.push(`Operador: ${String(dataPoint.operador)}`);
            }
            if (dataPoint.horaEjecucion) {
              lines.push(`Hora de ejecución: ${String(dataPoint.horaEjecucion)}`);
            }
            if (dataPoint.conductor) {
              lines.push(`Conductor: ${String(dataPoint.conductor)}`);
            }
            if (dataPoint.horaDespacho) {
              lines.push(`Hora de despacho: ${String(dataPoint.horaDespacho)}`);
            }
            return lines;
          }
        },
        backgroundColor: 'rgba(255, 255, 255, 1)',
        titleColor: 'rgba(0, 0, 0, 0.87)',
        bodyColor: 'rgba(0, 0, 0, 0.87)',
        borderColor: 'rgba(229, 231, 235, 1)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        titleFont: {
          size: 12,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 12
        }
      }
    },
    scales: {
      x: {
        display: true,
        offset: true,
        title: {
          display: !!xAxisLabel,
          text: xAxisLabel ?? '',
          font: {
            size: 12
          }
        },
        ticks: {
          font: {
            size: 12
          },
          color: '#6b7280',
          padding: 5
        },
        grid: {
          display: true,
          color: 'rgba(229, 231, 235, 1)',
          lineWidth: 1,
          offset: true
        }
      },
      y: {
        display: true,
        min: yAxisMin,
        max: yAxisMax,
        beginAtZero: yAxisMin === 0 || yAxisMin === undefined,
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel ?? '',
          font: {
            size: 12
          }
        },
        ticks: {
          font: {
            size: 12
          },
          color: '#6b7280',
          stepSize: 1,
          precision: 0
        },
        grid: {
          display: true,
          color: 'rgba(229, 231, 235, 1)',
          lineWidth: 1,
          borderDash: [3, 3]
        }
      }
    }
  };

  return (
    <div className="h-[200px] flex items-center justify-center" style={{ width }}>
      <div style={{ width, height }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};
