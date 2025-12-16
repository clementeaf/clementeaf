import { useState, useEffect } from 'react';
import { PageHeader, DataTablePage } from '../components/commons';
import { columns } from './Activity/columns';
import type { ActivityRow } from './Activity/columns';

interface UserActivity {
  id: number;
  userId: number;
  activityType: string;
  resourceType: string | null;
  resourceId: string | null;
  description: string;
  path: string | null;
  method: string | null;
  targetElement: string | null;
  targetId: string | null;
  targetText: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  sessionId: string | null;
  durationMs: number | null;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface ActivityStats {
  totalActivities: number;
  byType: Record<string, number>;
  byResource: Record<string, number>;
  topUsers: Array<{ userId: number; count: number }>;
  recentActivities: UserActivity[];
}

export const Activity = () => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('');
  const [userIdFilter, setUserIdFilter] = useState<string>('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [totalActivities, setTotalActivities] = useState<number>(0);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch activities
  const fetchActivities = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', String(page));
      queryParams.append('limit', String(limit));
      
      if (activityTypeFilter) queryParams.append('activityType', activityTypeFilter);
      if (resourceTypeFilter) queryParams.append('resourceType', resourceTypeFilter);
      if (userIdFilter) queryParams.append('userId', userIdFilter);

      const response = await fetch(`${API_URL}/activity?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar actividades');
      }

      const data: unknown = await response.json();
      if (typeof data !== 'object' || data === null) {
        throw new Error('Respuesta inválida del servidor');
      }
      const parsed = data as { activities?: UserActivity[]; pagination?: { total?: number } };
      setActivities(Array.isArray(parsed.activities) ? parsed.activities : []);
      setTotalActivities(typeof parsed.pagination?.total === 'number' ? parsed.pagination.total : 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar actividades');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/activity/stats`);
      
      if (!response.ok) {
        throw new Error('Error al cargar estadísticas');
      }

      const data: unknown = await response.json();
      setStats(data as ActivityStats);
    } catch (err: unknown) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [page, activityTypeFilter, resourceTypeFilter, userIdFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  const mappedActivities: ActivityRow[] = activities.map((activity) => ({
    id: activity.id.toString(),
    createdAt: activity.createdAt,
    userId: activity.userId,
    userName: activity.user?.name || `Usuario #${activity.userId}`,
    userEmail: activity.user?.email || '',
    activityType: activity.activityType,
    resourceType: activity.resourceType || '',
    resourceId: activity.resourceId || '',
    description: activity.description,
    path: activity.path || '',
    ipAddress: activity.ipAddress || '',
  }));

  const handleRefresh = () => {
    fetchActivities();
    fetchStats();
  };

  return (
    <div className="w-full h-full flex flex-col p-4">
      <PageHeader 
        title="Trazabilidad de Actividades" 
        actionButtons={[
          {
            label: 'Actualizar',
            onClick: handleRefresh,
            variant: 'secondary'
          }
        ]}
      />

      <div className="mb-4 text-sm text-gray-600">
        Total: <span className="font-semibold text-gray-900">{totalActivities.toLocaleString('es-CL')}</span>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Total Actividades</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalActivities.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Usuarios Activos</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.topUsers.length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Tipos de Eventos</p>
            <p className="text-3xl font-bold text-gray-900">
              {Object.keys(stats.byType).length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Recursos Rastreados</p>
            <p className="text-3xl font-bold text-gray-900">
              {Object.keys(stats.byResource).length}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Actividad
            </label>
            <select
              value={activityTypeFilter}
              onChange={(e) => {
                setActivityTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="page_view">Vista de Página</option>
              <option value="navigation">Navegación</option>
              <option value="click">Clic</option>
              <option value="form_submit">Envío de Formulario</option>
              <option value="search">Búsqueda</option>
              <option value="create">Crear</option>
              <option value="update">Actualizar</option>
              <option value="delete">Eliminar</option>
              <option value="view">Ver</option>
              <option value="download">Descargar</option>
              <option value="upload">Subir</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="error">Error</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Recurso
            </label>
            <select
              value={resourceTypeFilter}
              onChange={(e) => {
                setResourceTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="client">Cliente</option>
              <option value="quote">Cotización</option>
              <option value="product">Producto</option>
              <option value="user">Usuario</option>
              <option value="role">Rol</option>
              <option value="ticket">Ticket</option>
              <option value="chat">Chat</option>
              <option value="ocr">OCR</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID de Usuario
            </label>
            <input
              type="number"
              value={userIdFilter}
              onChange={(e) => {
                setUserIdFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Ej: 1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Activities Table */}
      <div className="flex-1 min-h-0">
        <DataTablePage<ActivityRow>
          data={mappedActivities}
          columns={columns}
          isLoading={loading}
          error={error ? new Error(error) : undefined}
          errorMessage="Error al cargar las actividades"
        />
      </div>
    </div>
  );
};
