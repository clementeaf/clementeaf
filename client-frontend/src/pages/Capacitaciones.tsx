/**
 * Página de Capacitaciones de la aplicación cliente
 * @returns Componente Capacitaciones
 */
export const Capacitaciones = (): React.ReactNode => {
  return (
    <div className="w-full h-full p-6 flex flex-col items-start justify-start gap-8">
      <h1 className="text-2xl font-bold text-gray-800">Capacitaciones</h1>
      <div className="w-full h-full bg-white rounded-lg shadow-sm p-4">
        <p className="text-gray-600">Contenido de capacitaciones</p>
      </div>
    </div>
  );
};

