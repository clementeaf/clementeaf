import { type ColumnDef } from '@tanstack/react-table';

export interface ActivityRow {
  id: string;
  createdAt: string;
  userId: number;
  userName: string;
  userEmail: string;
  activityType: string;
  resourceType: string;
  resourceId: string;
  description: string;
  path: string;
  ipAddress: string;
}

const activityTypeColors: Record<string, string> = {
  page_view: 'bg-blue-100 text-blue-800',
  navigation: 'bg-blue-100 text-blue-800',
  click: 'bg-gray-100 text-gray-800',
  form_submit: 'bg-indigo-100 text-indigo-800',
  search: 'bg-purple-100 text-purple-800',
  create: 'bg-green-100 text-green-800',
  update: 'bg-yellow-100 text-yellow-800',
  delete: 'bg-red-100 text-red-800',
  view: 'bg-blue-100 text-blue-800',
  download: 'bg-indigo-100 text-indigo-800',
  upload: 'bg-indigo-100 text-indigo-800',
  login: 'bg-green-100 text-green-800',
  logout: 'bg-gray-100 text-gray-800',
  error: 'bg-red-100 text-red-800',
  custom: 'bg-gray-100 text-gray-800',
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return dateString;
  }
};

export const columns: ColumnDef<ActivityRow>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Fecha/Hora',
    cell: ({ row }) => (
      <div className="text-sm text-gray-900">
        {formatDate(row.original.createdAt)}
      </div>
    ),
    enableSorting: true
  },
  {
    accessorKey: 'userName',
    header: 'Usuario',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">
          {row.original.userName}
        </span>
        {row.original.userEmail && (
          <span className="text-xs text-gray-500">
            {row.original.userEmail}
          </span>
        )}
      </div>
    ),
    enableSorting: true
  },
  {
    accessorKey: 'activityType',
    header: 'Tipo',
    cell: ({ row }) => {
      const type = row.original.activityType;
      const colorClass = activityTypeColors[type] || 'bg-gray-100 text-gray-800';
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
          {type.replace('_', ' ').toUpperCase()}
        </span>
      );
    },
    enableSorting: true
  },
  {
    accessorKey: 'resourceType',
    header: 'Recurso',
    cell: ({ row }) => {
      const resourceType = row.original.resourceType;
      const resourceId = row.original.resourceId;
      
      if (!resourceType) return <span className="text-sm text-gray-400">-</span>;
      
      return (
        <div className="flex flex-col">
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 w-fit">
            {resourceType}
          </span>
          {resourceId && (
            <span className="text-xs text-gray-500 mt-1">
              ID: {resourceId}
            </span>
          )}
        </div>
      );
    },
    enableSorting: true
  },
  {
    accessorKey: 'description',
    header: 'Descripción',
    cell: ({ row }) => (
      <div className="text-sm text-gray-900 max-w-md truncate">
        {row.original.description}
      </div>
    ),
    enableSorting: false
  },
  {
    accessorKey: 'path',
    header: 'Ruta',
    cell: ({ row }) => (
      <div className="text-xs text-gray-500 max-w-xs truncate">
        {row.original.path || '-'}
      </div>
    ),
    enableSorting: false
  },
  {
    accessorKey: 'ipAddress',
    header: 'IP',
    cell: ({ row }) => (
      <div className="text-xs text-gray-500">
        {row.original.ipAddress || '-'}
      </div>
    ),
    enableSorting: false
  }
];
