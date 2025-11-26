import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesService, type CreateQuoteDto, type Quote, type PaginatedQuotesResponse } from '../services/quotesService';

/**
 * Hook para crear una cotización
 */
export const useCreateQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quoteData: CreateQuoteDto) => quotesService.createQuote(quoteData),
    onSuccess: (quoteResponse, variables) => {
      // Construir el objeto Quote completo
      const newQuote: Quote = {
        id: quoteResponse.id,
        clienteNombre: quoteResponse.clienteNombre,
        direccionFacturacion: variables.direccionFacturacion || null,
        telefono: variables.telefono || null,
        regionComunaCodigo: variables.regionComunaCodigo || null,
        asesorAsignado: variables.asesorAsignado || null,
        contactoNombre: variables.contactoNombre || null,
        contactoTelefono: variables.contactoTelefono || null,
        contactoEmail: variables.contactoEmail || null,
        countryCode: variables.countryCode || null,
        countryDialCode: variables.countryDialCode || null,
        contactoCountryCode: variables.contactoCountryCode || null,
        contactoCountryDialCode: variables.contactoCountryDialCode || null,
        numeroCotizacion: quoteResponse.numeroCotizacion,
        fecha: variables.fecha || null,
        terminosPago: variables.terminosPago || null,
        numeroReferencia: variables.numeroReferencia || null,
        centroCosto: variables.centroCosto || null,
        listaPrecios: variables.listaPrecios || null,
        sinCostoEnvio: variables.sinCostoEnvio || false,
        productos: variables.productos || null,
        estado: quoteResponse.estado,
        createdAt: quoteResponse.createdAt,
        updatedAt: quoteResponse.updatedAt
      };

      // Actualización optimista
      queryClient.setQueriesData<PaginatedQuotesResponse>(
        { queryKey: ['quotes'] },
        (oldData) => {
          if (!oldData) {
            const newData = {
              data: [newQuote],
              total: 1,
              page: 1,
              limit: 50,
              totalPages: 1
            };
            persistQuotes(newData, 1, 50);
            return newData;
          }

          const updatedData = {
            ...oldData,
            data: [newQuote, ...oldData.data],
            total: oldData.total + 1
          };
          persistQuotes(updatedData, oldData.page || 1, oldData.limit || 50);
          return updatedData;
        }
      );

      queryClient.invalidateQueries({ 
        queryKey: ['quotes'],
        refetchType: 'none'
      });
    }
  });
};

/**
 * Hook para obtener una cotización por su ID
 * @param id - ID de la cotización
 */
export const useQuoteById = (id: number | null) => {
  return useQuery({
    queryKey: ['quote', id],
    queryFn: async () => {
      if (!id) throw new Error('ID is required');
      return await quotesService.getQuoteById(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: false
  });
};

/**
 * Clave para persistir datos de cotizaciones en localStorage
 */
const QUOTES_STORAGE_KEY = 'quotes_data';

/**
 * Obtiene los datos persistidos de cotizaciones desde localStorage
 */
const getPersistedQuotes = (page: number, limit: number): PaginatedQuotesResponse | null => {
  try {
    const stored = localStorage.getItem(`${QUOTES_STORAGE_KEY}_${page}_${limit}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && Array.isArray(parsed.data) && typeof parsed.total === 'number') {
        return parsed as PaginatedQuotesResponse;
      }
    }
  } catch (error) {
    console.error('Error al leer datos persistidos de cotizaciones:', error);
  }
  return null;
};

/**
 * Persiste los datos de cotizaciones en localStorage
 */
const persistQuotes = (data: PaginatedQuotesResponse, page: number, limit: number): void => {
  try {
    localStorage.setItem(`${QUOTES_STORAGE_KEY}_${page}_${limit}`, JSON.stringify(data));
  } catch (error) {
    console.error('Error al persistir datos de cotizaciones:', error);
  }
};

/**
 * Compara dos respuestas de cotizaciones para determinar si son diferentes
 */
const areQuotesDifferent = (oldData: PaginatedQuotesResponse | null, newData: PaginatedQuotesResponse): boolean => {
  if (!oldData) return true;
  
  if (oldData.total !== newData.total) return true;
  
  const oldIds = oldData.data.map(quote => quote.id).sort();
  const newIds = newData.data.map(quote => quote.id).sort();
  
  if (oldIds.length !== newIds.length) return true;
  
  for (let i = 0; i < oldIds.length; i++) {
    if (oldIds[i] !== newIds[i]) return true;
  }
  
  for (let i = 0; i < oldData.data.length; i++) {
    const oldQuote = oldData.data.find(q => q.id === oldIds[i]);
    const newQuote = newData.data.find(q => q.id === newIds[i]);
    
    if (!oldQuote || !newQuote) return true;
    if (oldQuote.updatedAt !== newQuote.updatedAt) return true;
  }
  
  return false;
};

/**
 * Hook para obtener todas las cotizaciones con paginación
 * @param page - Número de página
 * @param limit - Límite de resultados por página
 */
export const useAllQuotes = (page: number = 1, limit: number = 50) => {
  const [hasDataChanged, setHasDataChanged] = React.useState(false);
  const persistedData = React.useMemo(() => getPersistedQuotes(page, limit), [page, limit]);
  const originalPersistedData = React.useRef<PaginatedQuotesResponse | null>(persistedData);

  const query = useQuery({
    queryKey: ['quotes', page, limit],
    queryFn: async () => {
      const apiData = await quotesService.getAllQuotes(page, limit);
      const isDifferent = areQuotesDifferent(originalPersistedData.current, apiData);
      setHasDataChanged(isDifferent);
      persistQuotes(apiData, page, limit);
      originalPersistedData.current = apiData;
      return apiData;
    },
    staleTime: 1000 * 60 * 5,
    initialData: persistedData || undefined,
    placeholderData: persistedData || undefined,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

  React.useEffect(() => {
    originalPersistedData.current = persistedData;
  }, [persistedData]);

  const finalData = query.data || (query.isLoading ? persistedData : null);
  
  return {
    ...query,
    hasDataChanged,
    data: finalData
  };
};

/**
 * Hook para actualizar una cotización
 */
export const useUpdateQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateQuoteDto> }) =>
      quotesService.updateQuote(id, data),
    onSuccess: (_, variables) => {
      queryClient.setQueriesData<PaginatedQuotesResponse>(
        { queryKey: ['quotes'] },
        (oldData) => {
          if (!oldData) return oldData;
          
          const updatedData = {
            ...oldData,
            data: oldData.data.map(quote => 
              quote.id === variables.id 
                ? { ...quote, ...variables.data, updatedAt: new Date().toISOString() }
                : quote
            )
          };
          
          persistQuotes(updatedData, oldData.page || 1, oldData.limit || 50);
          return updatedData;
        }
      );
      
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote', variables.id] });
    }
  });
};

/**
 * Hook para eliminar una cotización
 */
export const useDeleteQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => quotesService.deleteQuote(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueriesData<PaginatedQuotesResponse>(
        { queryKey: ['quotes'] },
        (oldData) => {
          if (!oldData) return oldData;
          
          const updatedData = {
            ...oldData,
            data: oldData.data.filter(quote => quote.id !== deletedId),
            total: oldData.total - 1
          };
          
          persistQuotes(updatedData, oldData.page || 1, oldData.limit || 50);
          return updatedData;
        }
      );
      
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    }
  });
};

