import { useState } from 'react';
import { Table } from '../components/commons';
import { ClientsHeader } from './Clients/ClientsHeader';
import { ClientsFilters } from './Clients/ClientsFilters';
import { ClientsSearchBar } from './Clients/ClientsSearchBar';
import { columns } from './Clients/columns';
import { mockClients } from './Clients/mockData';
import type { ClientRow } from './Clients/columns';

/**
 * Página de clientes
 * @returns Componente Clients
 */
export const Clients = () => {
  const [searchValue, setSearchValue] = useState('');

  const handleCreateClient = (): void => {
    console.log('Crear cliente');
  };

  const handleSearchChange = (value: string): void => {
    setSearchValue(value);
  };

  return (
    <div className="w-full h-full flex flex-col p-4">
      <ClientsHeader onCreateClient={handleCreateClient} />

      <div className="flex gap-4 flex-1 min-h-0">
        <ClientsFilters />

        <div className="flex-1 flex flex-col min-w-0">
          <ClientsSearchBar searchValue={searchValue} onSearchChange={handleSearchChange} />

          <div className="flex-1 overflow-auto rounded-lg shadow-sm bg-white p">
            <Table<ClientRow>
              data={mockClients}
              columns={columns}
              enableSorting={true}
              containerClassName="w-full"
              tableClassName="w-full border-collapse"
              theadClassName="bg-gray-50 sticky top-0"
              headerRowClassName="border-b border-gray-200"
              headerCellClassName="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              bodyRowClassName="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
              bodyCellClassName="px-4 py-3 text-sm text-gray-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

