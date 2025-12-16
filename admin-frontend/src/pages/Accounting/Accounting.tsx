import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader, DataTablePage, Select } from '../../components/commons';
import { accountingService } from '../../services/accountingService';
import { accountingColumns } from './columns';

export const Accounting = (): React.ReactElement => {
  const [estadoPicking, setEstadoPicking] = useState<string>('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['accountingOverview', estadoPicking],
    queryFn: async () => {
      return await accountingService.getOverview({
        page: 1,
        limit: 50,
        ...(estadoPicking ? { estadoPicking } : {})
      });
    },
    staleTime: 1000 * 30
  });

  const rows = data?.data ?? [];

  const pickingOptions = [
    { value: '', label: 'Todos' },
    { value: 'iniciado', label: 'Iniciado' },
    { value: 'recolectado', label: 'Recolectado' },
    { value: 'confirmado', label: 'Confirmado' },
    { value: 'en_ruta', label: 'En Ruta' }
  ];

  return (
    <div className="w-full h-full flex flex-col p-8">
      <PageHeader
        title="Contabilidad"
        actionButtons={[
          {
            label: 'Actualizar',
            onClick: () => refetch(),
            variant: 'primary'
          }
        ]}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-end gap-4">
          <div className="w-64">
            <Select
              id="accounting-picking-filter"
              label="Estado Picking"
              value={estadoPicking}
              onChange={(e) => setEstadoPicking(e.target.value)}
              options={pickingOptions}
            />
          </div>
          {error && (
            <div className="text-sm text-red-600">
              Error cargando contabilidad
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <DataTablePage
          data={rows}
          columns={accountingColumns}
          isLoading={isLoading}
          errorMessage="Error al cargar contabilidad"
        />
      </div>
    </div>
  );
};


