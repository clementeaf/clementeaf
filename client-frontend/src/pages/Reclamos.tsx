import { useState } from 'react';
import { Table } from '../components/table';
import { ReclamosHeader } from './Reclamos/ReclamosHeader';
import { CreateClaimForm } from './Reclamos/CreateClaimForm';
import { claimColumns } from './Reclamos/columns';
import { mockClaims } from './Reclamos/mockData';
import { mockBills } from './Inicio/mockData';
import type { ClaimRow, ClaimFormData } from './Reclamos/types';

/**
 * Página de Reclamos de la aplicación cliente
 * @returns Componente Reclamos
 */
export const Reclamos = (): React.ReactNode => {
  const [claims, setClaims] = useState<ClaimRow[]>(mockClaims);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

  const handleCreateClaim = (): void => {
    setShowCreateForm(true);
  };

  const handleCancelCreate = (): void => {
    setShowCreateForm(false);
  };

  const handleSubmitClaim = (formData: ClaimFormData): void => {
    const selectedBill = mockBills.find((bill) => bill.id === formData.billId);
    if (!selectedBill) {
      return;
    }

    const selectedProducts = selectedBill.products.filter((p) => formData.productIds.includes(p.id));

    const newClaim: ClaimRow = {
      id: `claim-${Date.now()}`,
      billId: formData.billId,
      billNumber: selectedBill.number,
      productIds: formData.productIds,
      products: selectedProducts,
      description: formData.description,
      status: 'Pendiente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setClaims((prev) => [newClaim, ...prev]);
    setShowCreateForm(false);
  };

  return (
    <div className="w-full h-full p-6 flex flex-col items-start justify-start gap-8">
      <ReclamosHeader onCreateClaim={handleCreateClaim} />

      <div
        className={`w-full overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${
          showCreateForm
            ? 'max-h-[2000px] opacity-100'
            : 'max-h-0 opacity-0'
        }`}
      >
        <div
          className={`bg-white rounded-lg shadow-lg p-6 border border-gray-200 ${
            showCreateForm
              ? 'animate-slide-down'
              : 'animate-slide-up'
          }`}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Nuevo Reclamo</h2>
          <CreateClaimForm
            bills={mockBills}
            onSubmit={handleSubmitClaim}
            onCancel={handleCancelCreate}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-full bg-white rounded-lg shadow-sm p-4 overflow-auto">
        <Table<ClaimRow>
          data={claims}
          columns={claimColumns}
          enableSorting={true}
          containerClassName="w-full"
          tableClassName="w-full border-collapse"
          theadClassName="bg-gray-50 sticky top-0"
          headerRowClassName="border-b border-gray-200"
          headerCellClassName="px-4 py-3 text-left text-sm font-extrabold text-gray-600 leading-5 tracking-normal"
          bodyRowClassName="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
          bodyCellClassName="px-4 py-3 text-sm font-book text-black-900 leading-5 tracking-normal"
        />
      </div>
    </div>
  );
};

