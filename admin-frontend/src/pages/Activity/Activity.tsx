import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Create as CreateIcon,
  Delete as DeleteIcon,
  Login as LoginIcon,
  Navigation as NavigationIcon,
  TouchApp as TouchAppIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

// Types
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
  metadata: Record<string, any> | null;
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

const activityTypeColors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'> = {
  page_view: 'info',
  navigation: 'info',
  click: 'default',
  form_submit: 'primary',
  search: 'secondary',
  create: 'success',
  update: 'warning',
  delete: 'error',
  view: 'info',
  download: 'primary',
  upload: 'primary',
  login: 'success',
  logout: 'default',
  error: 'error',
  custom: 'default',
};

const activityTypeIcons: Record<string, React.ReactNode> = {
  page_view: <VisibilityIcon fontSize="small" />,
  navigation: <NavigationIcon fontSize="small" />,
  click: <TouchAppIcon fontSize="small" />,
  create: <CreateIcon fontSize="small" />,
  delete: <DeleteIcon fontSize="small" />,
  login: <LoginIcon fontSize="small" />,
};

const Activity: React.FC = () => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('');
  const [userIdFilter, setUserIdFilter] = useState<string>('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalActivities, setTotalActivities] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch activities
  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', String(page + 1));
      queryParams.append('limit', String(rowsPerPage));
      
      if (activityTypeFilter) queryParams.append('activityType', activityTypeFilter);
      if (resourceTypeFilter) queryParams.append('resourceType', resourceTypeFilter);
      if (userIdFilter) queryParams.append('userId', userIdFilter);

      const response = await fetch(`${API_URL}/activity?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar actividades');
      }

      const data = await response.json();
      setActivities(data.activities);
      setTotalActivities(data.pagination.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/activity/stats`);
      
      if (!response.ok) {
        throw new Error('Error al cargar estadísticas');
      }

      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [page, rowsPerPage, activityTypeFilter, resourceTypeFilter, userIdFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    fetchActivities();
    fetchStats();
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'dd/MM/yyyy HH:mm:ss');
    } catch {
      return timestamp;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Trazabilidad de Actividades
        </Typography>
        <Tooltip title="Actualizar">
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Actividades
                </Typography>
                <Typography variant="h4">
                  {stats.totalActivities.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Usuarios Activos
                </Typography>
                <Typography variant="h4">
                  {stats.topUsers.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Tipos de Eventos
                </Typography>
                <Typography variant="h4">
                  {Object.keys(stats.byType).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Recursos Rastreados
                </Typography>
                <Typography variant="h4">
                  {Object.keys(stats.byResource).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Tipo de Actividad"
              value={activityTypeFilter}
              onChange={(e) => {
                setActivityTypeFilter(e.target.value);
                setPage(0);
              }}
              size="small"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="page_view">Vista de Página</MenuItem>
              <MenuItem value="navigation">Navegación</MenuItem>
              <MenuItem value="click">Clic</MenuItem>
              <MenuItem value="form_submit">Envío de Formulario</MenuItem>
              <MenuItem value="search">Búsqueda</MenuItem>
              <MenuItem value="create">Crear</MenuItem>
              <MenuItem value="update">Actualizar</MenuItem>
              <MenuItem value="delete">Eliminar</MenuItem>
              <MenuItem value="view">Ver</MenuItem>
              <MenuItem value="download">Descargar</MenuItem>
              <MenuItem value="upload">Subir</MenuItem>
              <MenuItem value="login">Login</MenuItem>
              <MenuItem value="logout">Logout</MenuItem>
              <MenuItem value="error">Error</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Tipo de Recurso"
              value={resourceTypeFilter}
              onChange={(e) => {
                setResourceTypeFilter(e.target.value);
                setPage(0);
              }}
              size="small"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="client">Cliente</MenuItem>
              <MenuItem value="quote">Cotización</MenuItem>
              <MenuItem value="product">Producto</MenuItem>
              <MenuItem value="user">Usuario</MenuItem>
              <MenuItem value="role">Rol</MenuItem>
              <MenuItem value="ticket">Ticket</MenuItem>
              <MenuItem value="chat">Chat</MenuItem>
              <MenuItem value="ocr">OCR</MenuItem>
              <MenuItem value="whatsapp">WhatsApp</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="ID de Usuario"
              value={userIdFilter}
              onChange={(e) => {
                setUserIdFilter(e.target.value);
                setPage(0);
              }}
              size="small"
              type="number"
              placeholder="Ej: 1"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Activities Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha/Hora</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Recurso</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Ruta</TableCell>
                <TableCell>IP</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      No hay actividades registradas
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((activity) => (
                  <TableRow key={activity.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {formatTimestamp(activity.createdAt)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Stack direction="column" spacing={0.5}>
                        <Typography variant="body2">
                          {activity.user?.name || `Usuario #${activity.userId}`}
                        </Typography>
                        {activity.user?.email && (
                          <Typography variant="caption" color="textSecondary">
                            {activity.user.email}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        size="small"
                        icon={activityTypeIcons[activity.activityType]}
                        label={activity.activityType.replace('_', ' ').toUpperCase()}
                        color={activityTypeColors[activity.activityType] || 'default'}
                      />
                    </TableCell>
                    
                    <TableCell>
                      {activity.resourceType && (
                        <Stack direction="column" spacing={0.5}>
                          <Chip
                            size="small"
                            label={activity.resourceType}
                            variant="outlined"
                          />
                          {activity.resourceId && (
                            <Typography variant="caption" color="textSecondary">
                              ID: {activity.resourceId}
                            </Typography>
                          )}
                        </Stack>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {activity.description}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="caption" color="textSecondary">
                        {activity.path || '-'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="caption" color="textSecondary">
                        {activity.ipAddress || '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={totalActivities}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>
    </Box>
  );
};

export default Activity;
