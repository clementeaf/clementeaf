/**
 * Props del componente MetricCard
 */
interface MetricCardProps {
  /**
   * Título de la métrica
   */
  title: string;
  /**
   * Valor de la métrica
   */
  value: string | number;
  /**
   * Subtítulo o descripción adicional
   */
  subtitle?: string;
}

/**
 * Componente para mostrar una tarjeta de métrica
 * @param props - Props del componente MetricCard
 * @returns Componente MetricCard
 */
export const MetricCard = ({ title, value, subtitle }: MetricCardProps): React.ReactElement => {
  return (
    <div className="bg-white w-[25%] h-full rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
      <div>
        <p className="text-sm font-book text-gray-600 leading-5 tracking-normal mb-2">
          {title}
        </p>
        <p className="text-2xl font-extrabold text-black-900 leading-7">
          {value}
        </p>
      </div>
      {subtitle && (
        <p className="text-xs font-book text-gray-600 leading-4 mt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
};

