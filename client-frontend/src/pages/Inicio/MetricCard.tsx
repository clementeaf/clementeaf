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
    <div className="bg-white flex-1 h-full rounded-lg shadow-sm border border-gray-200 flex flex-col justify-center p-6 gap-1">
      <p className="text-sm font-book text-gray-600 tracking-normal">
        {title}
      </p>
      <p className="text-[20px] font-extrabold text-black-900">
        {value}
      </p>
      {subtitle && (
        <p className="text-xs font-book text-gray-600">
          {subtitle}
        </p>
      )}
    </div>
  );
};

