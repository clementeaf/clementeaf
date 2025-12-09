import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsService, type CreateClientDto, type Client, type PaginatedClientsResponse } from '../services/clientsService';
import { logger } from '../utils/logger';

/**
 * Hook para crear un cliente
 */
export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clientData: CreateClientDto) => clientsService.createClient(clientData),
    onSuccess: (clientResponse, variables) => {
      // Construir el objeto Client completo a partir de la respuesta y los datos enviados
      const newClient: Client = {
        id: clientResponse.id,
        rut: clientResponse.rut,
        razonSocial: clientResponse.razonSocial,
        nombreCliente: clientResponse.nombreCliente,
        rutCompleto: clientResponse.rutCompleto,
        giro: clientResponse.giro,
        sitioWeb: clientResponse.sitioWeb,
        propietarioCliente: variables.propietarioCliente || null,
        tamanoEmpresa: variables.tamanoEmpresa || null,
        segmento: variables.segmento || null,
        subsegmento: variables.subsegmento || null,
        empleados: variables.empleados || null,
        tratos: variables.tratos || null,
        documentoPorDefecto: variables.documentoPorDefecto || null,
        formaPago: variables.formaPago || null,
        listaPrecios: variables.listaPrecios || null,
        ingresosAnuales: variables.ingresosAnuales || null,
        limiteCredito: variables.limiteCredito || null,
        creditoUsado: variables.creditoUsado || null,
        motivoBloqueo: variables.motivoBloqueo || null,
        respaldoRUT: variables.respaldoRUT || null,
        clienteExigeOC: variables.clienteExigeOC || false,
        aprobadoPorFinanzas: variables.aprobadoPorFinanzas || false,
        contactoNombre: variables.contactoNombre || null,
        contactoCargo: variables.contactoCargo || null,
        contactoCorreoElectronico: variables.contactoCorreoElectronico || null,
        contactoTelefono: variables.contactoTelefono || null,
        contactoCountryCode: variables.contactoCountryCode || null,
        contactoCountryDialCode: variables.contactoCountryDialCode || null,
        direccionFacturacion: variables.direccionFacturacion || null,
        regionFacturacion: variables.regionFacturacion || null,
        comunaFacturacion: variables.comunaFacturacion || null,
        codigoPostalFacturacion: variables.codigoPostalFacturacion || null,
        direccionDespacho: variables.direccionDespacho || null,
        regionDespacho: variables.regionDespacho || null,
        comunaDespacho: variables.comunaDespacho || null,
        codigoPostalDespacho: variables.codigoPostalDespacho || null,
        usarMismaDireccion: variables.usarMismaDireccion || false,
        createdAt: clientResponse.createdAt,
        updatedAt: clientResponse.updatedAt
      };

      // Actualización optimista: agregar el nuevo cliente a la cache
      queryClient.setQueriesData<PaginatedClientsResponse>(
        { queryKey: ['clients'] },
        (oldData) => {
          if (!oldData) {
            const newData = {
              data: [newClient],
              total: 1,
              page: 1,
              limit: 50,
              totalPages: 1
            };
            
            // Persistir los nuevos datos
            persistClients(newData, 1, 50);
            
            return newData;
          }

          // Agregar el nuevo cliente al inicio de la lista
          const updatedData = {
            ...oldData,
            data: [newClient, ...oldData.data],
            total: oldData.total + 1
          };

          // Persistir los datos actualizados
          persistClients(updatedData, oldData.page || 1, oldData.limit || 50);

          return updatedData;
        }
      );

      // Invalidar la query pero sin refetch inmediato para evitar sobrescribir el cliente optimista
      // El refetch se hará en background cuando sea necesario
      queryClient.invalidateQueries({ 
        queryKey: ['clients'],
        refetchType: 'none' // No hacer refetch inmediato
      });
    }
  });
};

/**
 * Hook para obtener un cliente por su ID
 * @param id - ID del cliente
 */
export const useClientById = (id: number | null) => {
  return useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      if (!id) throw new Error('ID is required');
      logger.debug('useClientById - Buscando cliente', { id });
      // El servicio devuelve null si el cliente no existe (404)
      const client = await clientsService.getClientById(id);
      logger.debug('useClientById - Cliente encontrado', { found: !!client });
      return client;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: false // No reintentar en caso de 404
  });
};

/**
 * Clave para persistir datos de clientes en localStorage
 */
const CLIENTS_STORAGE_KEY = 'clients_data';

/**
 * Obtiene los datos persistidos de clientes desde localStorage
 */
const getPersistedClients = (page: number, limit: number): PaginatedClientsResponse | null => {
  try {
    const stored = localStorage.getItem(`${CLIENTS_STORAGE_KEY}_${page}_${limit}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Verificar que tenga la estructura correcta
      if (parsed && Array.isArray(parsed.data) && typeof parsed.total === 'number') {
        return parsed as PaginatedClientsResponse;
      }
    }
  } catch (error) {
    logger.error('Error al leer datos persistidos de clientes', error);
  }
  return null;
};

/**
 * Persiste los datos de clientes en localStorage
 */
const persistClients = (data: PaginatedClientsResponse, page: number, limit: number): void => {
  try {
    localStorage.setItem(`${CLIENTS_STORAGE_KEY}_${page}_${limit}`, JSON.stringify(data));
  } catch (error) {
    logger.error('Error al persistir datos de clientes', error);
  }
};

/**
 * Compara dos respuestas de clientes para determinar si son diferentes
 */
const areClientsDifferent = (oldData: PaginatedClientsResponse | null, newData: PaginatedClientsResponse): boolean => {
  if (!oldData) return true;
  
  // Comparar total
  if (oldData.total !== newData.total) return true;
  
  // Comparar IDs de clientes
  const oldIds = oldData.data.map(client => client.id).sort();
  const newIds = newData.data.map(client => client.id).sort();
  
  if (oldIds.length !== newIds.length) return true;
  
  for (let i = 0; i < oldIds.length; i++) {
    if (oldIds[i] !== newIds[i]) return true;
  }
  
  // Comparar updatedAt de cada cliente
  for (let i = 0; i < oldData.data.length; i++) {
    const oldClient = oldData.data.find(c => c.id === oldIds[i]);
    const newClient = newData.data.find(c => c.id === newIds[i]);
    
    if (!oldClient || !newClient) return true;
    if (oldClient.updatedAt !== newClient.updatedAt) return true;
  }
  
  return false;
};

/**
 * Hook para obtener todos los clientes con paginación
 * Incluye persistencia inteligente: muestra datos persistidos inmediatamente
 * y solo muestra skeleton si los datos de la API son diferentes
 * @param page - Número de página
 * @param limit - Límite de resultados por página
 */
export const useAllClients = (page: number = 1, limit: number = 50) => {
  const [hasDataChanged, setHasDataChanged] = React.useState(false);
  const persistedData = React.useMemo(() => getPersistedClients(page, limit), [page, limit]);
  
  // Guardar los datos persistidos originales antes de la query
  const originalPersistedData = React.useRef<PaginatedClientsResponse | null>(persistedData);

  const query = useQuery({
    queryKey: ['clients', page, limit],
    queryFn: async () => {
      const apiData = await clientsService.getAllClients(page, limit);
      
      // Comparar con datos persistidos ORIGINALES (antes de persistir)
      const isDifferent = areClientsDifferent(originalPersistedData.current, apiData);
      
      // Establecer hasDataChanged antes de persistir
      setHasDataChanged(isDifferent);
      
      // Persistir nuevos datos siempre (para mantener actualizado)
      persistClients(apiData, page, limit);
      
      // Actualizar la referencia para la próxima comparación
      originalPersistedData.current = apiData;
      
      return apiData;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    initialData: persistedData || undefined, // Usar datos persistidos como initialData
    placeholderData: persistedData || undefined, // Usar datos persistidos como placeholder
    // Solo refetch si los datos están stale (más de 5 minutos)
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  // Actualizar la referencia cuando los datos persistidos cambian
  React.useEffect(() => {
    originalPersistedData.current = persistedData;
  }, [persistedData]);

  // Priorizar datos de la API sobre datos persistidos
  // Si la query tiene datos (de la API), usarlos; si no, usar persistidos solo como fallback inicial
  const finalData = query.data || (query.isLoading ? persistedData : null);
  
  return {
    ...query,
    hasDataChanged, // Indica si los datos de la API son diferentes a los persistidos
    data: finalData // Priorizar datos de API, solo usar persistidos durante carga inicial
  };
};

/**
 * Hook para actualizar un cliente
 */
export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateClientDto> }) =>
      clientsService.updateClient(id, data),
    onSuccess: (_, variables) => {
      // Actualizar cache y persistir
      queryClient.setQueriesData<PaginatedClientsResponse>(
        { queryKey: ['clients'] },
        (oldData) => {
          if (!oldData) return oldData;
          
          // Actualizar el cliente en la lista
          const updatedData = {
            ...oldData,
            data: oldData.data.map(client => 
              client.id === variables.id 
                ? { ...client, ...variables.data, updatedAt: new Date().toISOString() }
                : client
            )
          };
          
          // Persistir los datos actualizados
          persistClients(updatedData, oldData.page || 1, oldData.limit || 50);
          
          return updatedData;
        }
      );
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
    }
  });
};

/**
 * Hook para eliminar un cliente
 */
export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => clientsService.deleteClient(id),
    onSuccess: (_, deletedId) => {
      // Actualizar cache y persistir
      queryClient.setQueriesData<PaginatedClientsResponse>(
        { queryKey: ['clients'] },
        (oldData) => {
          if (!oldData) return oldData;
          
          // Remover el cliente de la lista
          const updatedData = {
            ...oldData,
            data: oldData.data.filter(client => client.id !== deletedId),
            total: oldData.total - 1
          };
          
          // Persistir los datos actualizados
          persistClients(updatedData, oldData.page || 1, oldData.limit || 50);
          
          return updatedData;
        }
      );
      
      // Invalidar la query de lista de clientes
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });
};

