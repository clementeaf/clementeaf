import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsService, type CreateClientDto, type Client, type PaginatedClientsResponse } from '../services/clientsService';

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
            return {
              data: [newClient],
              total: 1,
              page: 1,
              limit: 50,
              totalPages: 1
            };
          }

          // Agregar el nuevo cliente al inicio de la lista
          const updatedData = {
            ...oldData,
            data: [newClient, ...oldData.data],
            total: oldData.total + 1
          };

          return updatedData;
        }
      );

      // Invalidar la query para asegurar que los datos estén sincronizados con el servidor
      queryClient.invalidateQueries({ queryKey: ['clients'] });
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
    queryFn: () => {
      if (!id) throw new Error('ID is required');
      return clientsService.getClientById(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5 // 5 minutos
  });
};

/**
 * Hook para obtener todos los clientes con paginación
 * @param page - Número de página
 * @param limit - Límite de resultados por página
 */
export const useAllClients = (page: number = 1, limit: number = 50) => {
  return useQuery({
    queryKey: ['clients', page, limit],
    queryFn: () => clientsService.getAllClients(page, limit),
    staleTime: 1000 * 60 * 5 // 5 minutos
  });
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
    onSuccess: () => {
      // Invalidar la query de lista de clientes
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });
};

