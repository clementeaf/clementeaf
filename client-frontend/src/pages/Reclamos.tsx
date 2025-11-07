/**
 * Página de Reclamos de la aplicación cliente
 * @returns Componente Reclamos
 */
export const Reclamos = (): React.ReactNode => {
  return (
    <div className="w-full h-full p-6 flex flex-col items-start justify-start gap-8">
      <h1 className="text-2xl font-bold text-gray-800">Reclamos</h1>
      <div className="w-full h-full bg-white rounded-lg shadow-sm p-4">
        <p className="text-gray-600">Contenido de reclamos</p>
      </div>
    </div>
  );
};

