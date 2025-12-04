import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';

/**
 * Flag para verificar si Chart.js ya fue registrado
 */
let isChartRegistered = false;

/**
 * Registra los componentes de Chart.js una sola vez
 * Evita re-registros innecesarios que pueden causar problemas de rendimiento
 */
export const registerChartJS = (): void => {
  if (!isChartRegistered) {
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
    isChartRegistered = true;
  }
};

