import { useState } from 'react';
import { Table } from '../components/table';
import { trainingColumns } from './Capacitaciones/columns';
import { mockTrainings } from './Capacitaciones/mockData';
import { VideoPlayer } from './Capacitaciones/VideoPlayer';
import type { TrainingRow } from './Capacitaciones/types';

/**
 * Página de Capacitaciones de la aplicación cliente
 * @returns Componente Capacitaciones
 */
export const Capacitaciones = (): React.ReactNode => {
  const [trainings] = useState<TrainingRow[]>(mockTrainings);
  const [selectedTraining, setSelectedTraining] = useState<TrainingRow | null>(null);

  const handleViewTraining = (training: TrainingRow): void => {
    setSelectedTraining(training);
  };

  const handleCloseVideo = (): void => {
    setSelectedTraining(null);
  };

  const columnsWithActions = trainingColumns.map((column) => {
    if (column.id === 'actions') {
      return {
        ...column,
        cell: ({ row }: { row: { original: TrainingRow } }) => {
          return (
            <button
              onClick={() => handleViewTraining(row.original)}
              className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
            >
              Ver Video
            </button>
          );
        }
      };
    }
    return column;
  });

  return (
    <div className="w-full h-full p-6 flex flex-col items-start justify-start gap-8">
      <h1 className="text-2xl font-bold text-gray-800">Capacitaciones</h1>
      <div className="flex-1 flex flex-col min-w-full bg-white rounded-lg shadow-sm p-4 overflow-auto">
        {trainings.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600">No hay capacitaciones disponibles. Las capacitaciones aparecerán cuando compres productos que incluyan capacitación.</p>
          </div>
        ) : (
          <Table<TrainingRow>
            data={trainings}
            columns={columnsWithActions}
            enableSorting={true}
            containerClassName="w-full"
            tableClassName="w-full border-collapse"
            theadClassName="bg-gray-50 sticky top-0"
            headerRowClassName="border-b border-gray-200"
            headerCellClassName="px-4 py-3 text-left text-sm font-extrabold text-gray-600 leading-5 tracking-normal"
            bodyRowClassName="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
            bodyCellClassName="px-4 py-3 text-sm font-book text-black-900 leading-5 tracking-normal"
          />
        )}
      </div>
      {selectedTraining && (
        <VideoPlayer training={selectedTraining} onClose={handleCloseVideo} />
      )}
    </div>
  );
};

