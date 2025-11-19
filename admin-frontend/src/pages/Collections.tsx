import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useEstadisticas,
  useDeudasActivasInfinite
} from '../hooks/useAnalytics';
import { CollectionsFilters } from './Collections/CollectionsFilters';
import { ActionsMenu, EyeIcon, EmailIcon, AutomationIcon, Modal, Checkbox, Button } from '../components/commons';
import { AutomationCompanySearch } from './Collections/AutomationCompanySearch';
import type { QueryFilters, SortField, SortOrder } from '../types/analytics';
import type { CtasPorCobrar } from '../types/analytics';
import type { AutomationConfig } from './Collections/AutomationCompanySearch';
import { DropdownIcon, ChevronUpIcon } from '../components/commons/icons';

/**
 * Página de Cuentas por Cobrar
 * @returns Componente Collections
 */
export const Collections = () => {
  const limit = 10;
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<Omit<QueryFilters, 'page' | 'limit'>>({});
  const [sortBy, setSortBy] = useState<SortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
  const [isQuickActionsMenuOpen, setIsQuickActionsMenuOpen] = useState(false);
  const quickActionsMenuRef = useRef<HTMLDivElement>(null);
  // Estado principal: empresas seleccionadas por RUT (sincronizado entre tabla y modal)
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  const [automationConfig, setAutomationConfig] = useState<AutomationConfig>({
    autoSendEnabled: false,
    sendDaysBefore: {
      enabled: false,
      days: 0
    },
    sendDaysAfter: {
      enabled: false,
      days: 0
    },
    sendOnDueDate: false
  });

  const { data: estadisticas, isLoading: loadingStats } = useEstadisticas();
  // Combinar filtros con ordenamiento
  const filtersWithSort = useMemo(() => {
    const result = {
      ...filters,
      sortBy,
      sortOrder: sortBy ? sortOrder : undefined
    };
    // Debug: verificar que los parámetros se están pasando correctamente
    if (sortBy) {
      console.log('Ordenamiento activo:', { sortBy, sortOrder: result.sortOrder, filters: result });
    }
    return result;
  }, [filters, sortBy, sortOrder]);

  const {
    data: deudasActivasData,
    isLoading: loadingDeudas,
    isFetching: isFetchingDeudas,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useDeudasActivasInfinite(limit, filtersWithSort);

  /**
   * Maneja el cambio de ordenamiento
   */
  const handleSort = (field: SortField): void => {
    const newSortBy = sortBy === field ? sortBy : field;
    const newSortOrder = sortBy === field 
      ? (sortOrder === 'asc' ? 'desc' : 'asc')
      : 'asc';
    
    // Actualizar el estado primero
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    
    // Resetear y refetch las queries cuando cambia el ordenamiento
    // Esto fuerza a React Query a recargar desde la página 1 con el nuevo ordenamiento
    queryClient.resetQueries({ 
      queryKey: ['deudas-activas-infinite'],
      exact: false
    });
  };

  /**
   * Efecto para resetear el scroll cuando cambian los filtros o el ordenamiento
   */
  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  }, [filters, sortBy, sortOrder]);

  /**
   * Cierra el menú de acciones rápidas cuando se hace click fuera
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (quickActionsMenuRef.current && !quickActionsMenuRef.current.contains(event.target as Node)) {
        setIsQuickActionsMenuOpen(false);
      }
    };

    if (isQuickActionsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isQuickActionsMenuOpen]);

  /**
   * Obtiene todas las empresas de todas las páginas cargadas
   * Maneja tanto la estructura antigua (lista de documentos) como la nueva (lista de empresas)
   */
  const allEmpresas = useMemo(() => {
    if (!deudasActivasData?.pages || deudasActivasData.pages.length === 0) {
      return [];
    }
    
    // Obtener todos los datos de todas las páginas
    // IMPORTANTE: El backend ya ordena los datos, así que solo necesitamos combinarlos
    const allData = deudasActivasData.pages.flatMap(page => page.data || []);
    
    if (allData.length === 0) {
      return [];
    }
    
    // Debug: verificar el orden de los datos recibidos
    if (sortBy && allData.length > 0) {
      console.log('Frontend - Datos recibidos:', {
        sortBy,
        sortOrder,
        totalPages: deudasActivasData.pages.length,
        firstPageCount: deudasActivasData.pages[0]?.data?.length || 0,
        first3Razsoc: allData.slice(0, 3).map((e: any) => e.razsoc || e.rut)
      });
    }
    
    // Verificar si la primera entrada tiene la estructura de EmpresaConDocumentos (tiene 'documentos')
    const firstItem = allData[0];
    const isEmpresaStructure = firstItem && typeof firstItem === 'object' && 'documentos' in firstItem;
    
    if (isEmpresaStructure) {
      // Estructura nueva: ya viene agrupada por empresa y ordenada del backend
      // NO reordenar aquí, el backend ya lo hizo
      return allData as Array<{
        rut: string;
        razsoc: string;
        cliente_email: string | null;
        cliente_telefono: string | null;
        documentos: CtasPorCobrar[];
        total_deuda: number;
        total_documentos: number;
        vencimientoMasReciente?: string | null;
      }>;
    } else {
      // Estructura antigua: lista de documentos, necesitamos agrupar por empresa
      const empresasMap = new Map<string, {
        rut: string;
        razsoc: string;
        cliente_email: string | null;
        cliente_telefono: string | null;
        documentos: CtasPorCobrar[];
        total_deuda: number;
        total_documentos: number;
        vencimientoMasReciente: string | null;
      }>();
      
      (allData as unknown as CtasPorCobrar[]).forEach((doc: CtasPorCobrar) => {
        if (!doc.rut) return;
        
        if (!empresasMap.has(doc.rut)) {
          empresasMap.set(doc.rut, {
            rut: doc.rut,
            razsoc: doc.razsoc || '',
            cliente_email: doc.cliente_email || null,
            cliente_telefono: doc.cliente_telefono || null,
            documentos: [],
            total_deuda: 0,
            total_documentos: 0,
            vencimientoMasReciente: null
          });
        }
        
        const empresa = empresasMap.get(doc.rut)!;
        empresa.documentos.push(doc);
        // Convertir deuda a número si es string, o usar 0 si es null/undefined
        const deudaValue = typeof doc.deuda === 'string' ? parseFloat(doc.deuda) || 0 : (doc.deuda ?? 0);
        empresa.total_deuda += isNaN(deudaValue) ? 0 : deudaValue;
        empresa.total_documentos += 1;
      });
      
      // Calcular vencimientoMasReciente para cada empresa
      return Array.from(empresasMap.values()).map(empresa => {
        const fechasVencimiento = empresa.documentos
          .map(doc => doc.vencimiento ? new Date(doc.vencimiento) : null)
          .filter((date): date is Date => date !== null);
        
        const vencimientoMasReciente = fechasVencimiento.length > 0
          ? fechasVencimiento.sort((a, b) => b.getTime() - a.getTime())[0].toISOString()
          : null;
        
        return {
          ...empresa,
          vencimientoMasReciente
        };
      });
    }
  }, [deudasActivasData?.pages]);

  /**
   * Obtiene todos los documentos de todas las empresas (para compatibilidad con código existente)
   */
  const allDeudas = useMemo(() => {
    return allEmpresas
      .flatMap(empresa => empresa.documentos || [])
      .filter((deuda): deuda is CtasPorCobrar => deuda !== null && deuda !== undefined);
  }, [allEmpresas]);

  /**
   * Maneja el scroll infinito
   */
  const handleScroll = useCallback(() => {
    if (!tableContainerRef.current) return;
    if (!hasNextPage || isFetchingNextPage) return;

    const container = tableContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    
    // Cargar cuando queden 200px para el final
    const threshold = 200;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    
    if (distanceFromBottom <= threshold) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  /**
   * Efecto para agregar el listener de scroll
   */
  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  /**
   * Formatea un valor numérico como moneda chilena
   * @param value - Valor numérico a formatear
   * @returns String formateado como moneda
   */
  const formatCurrency = (value: number | string | null | undefined): string => {
    // Convertir a número si es string, o usar 0 si es null/undefined
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : (value ?? 0);
    
    // Verificar que sea un número válido
    if (isNaN(numValue) || !isFinite(numValue)) {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
      }).format(0);
    }
    
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(numValue);
  };

  /**
   * Formatea una fecha a formato chileno
   * @param dateString - Fecha en formato string
   * @returns String formateado como fecha
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  /**
   * Obtiene todas las empresas únicas (RUTs) de las empresas visibles
   */
  const uniqueCompanyRuts = useMemo(() => {
    return allEmpresas
      .map(empresa => empresa.rut)
      .filter((rut): rut is string => Boolean(rut));
  }, [allEmpresas]);

  /**
   * Maneja la selección/deselección de una fila en la tabla
   * Agrega o quita la empresa (RUT) de las seleccionadas
   */
  const handleRowToggle = (deuda: CtasPorCobrar): void => {
    if (!deuda.rut) return;

    setSelectedCompanies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deuda.rut!)) {
        newSet.delete(deuda.rut!);
      } else {
        newSet.add(deuda.rut!);
      }
      return newSet;
    });
  };

  /**
   * Maneja la selección/deselección de todas las empresas visibles
   */
  const handleSelectAll = (): void => {
    const allRutsSelected = uniqueCompanyRuts.every(rut => selectedCompanies.has(rut));
    
    if (allRutsSelected) {
      // Deseleccionar todas las empresas visibles
      setSelectedCompanies(prev => {
        const newSet = new Set(prev);
        uniqueCompanyRuts.forEach(rut => newSet.delete(rut));
        return newSet;
      });
    } else {
      // Seleccionar todas las empresas visibles
      setSelectedCompanies(prev => {
        const newSet = new Set(prev);
        uniqueCompanyRuts.forEach(rut => newSet.add(rut));
        return newSet;
      });
    }
  };

  /**
   * Verifica si todas las empresas visibles están seleccionadas
   */
  const isAllSelected = uniqueCompanyRuts.length > 0 && uniqueCompanyRuts.every(rut => selectedCompanies.has(rut));

  /**
   * Maneja el cambio de selección de empresas desde el modal
   */
  const handleCompaniesSelectionChange = (companyRuts: string[]): void => {
    setSelectedCompanies(new Set(companyRuts));
  };

  if (loadingStats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-500">Cargando cuentas por cobrar...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden p-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-shrink-0 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Cuentas por Cobrar</h1>
        {estadisticas && (
          <div className="text-sm text-gray-500">
            Última sincronización: {formatDate(estadisticas.ultima_sincronizacion)}
          </div>
        )}
      </div>

      {/* Estadísticas Generales */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Documentos</h3>
            <p className="text-2xl font-bold text-gray-900">{estadisticas.total_documentos.toLocaleString()}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Deuda Total</h3>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(estadisticas.deuda_total)}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Documentos Activos</h3>
            <p className="text-2xl font-bold text-blue-600">{estadisticas.documentos_activos.toLocaleString()}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Documentos Vencidos</h3>
            <p className="text-2xl font-bold text-orange-600">{estadisticas.documentos_vencidos.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Contenedor principal con filtros y tabla */}
      <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
        {/* Panel de Filtros */}
        <CollectionsFilters
          filters={filters}
          onFiltersChange={setFilters}
          className="flex-shrink-0"
        />

        {/* Tabla de Cuentas por Cobrar */}
        <div className="bg-white p-6 rounded-lg shadow flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <div className="flex items-center gap-4">
              {selectedCompanies.size > 0 && (
                <div className="text-sm text-blue-600 font-medium">
                  {selectedCompanies.size} empresa{selectedCompanies.size !== 1 ? 's' : ''} seleccionada{selectedCompanies.size !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="relative" ref={quickActionsMenuRef}>
                <Button
                  onClick={() => setIsQuickActionsMenuOpen(!isQuickActionsMenuOpen)}
                  className="bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  rightIcon={<DropdownIcon color="#FFFFFF" />}
                >
                  Acciones rápidas
                </Button>
                {isQuickActionsMenuOpen && (
                  <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAutomationModalOpen(true);
                        setIsQuickActionsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center gap-2 transition-colors whitespace-nowrap"
                    >
                      <AutomationIcon color="#6B7280" />
                      <span className="whitespace-nowrap">Automatizar notificación/es</span>
                    </button>
                  </div>
                )}
              </div>
              {allEmpresas.length > 0 && (
                <div className="text-sm text-gray-500">
                  Mostrando {allEmpresas.length} de {deudasActivasData?.pages[0]?.total || 0} empresas
                </div>
              )}
            </div>
          </div>
        {(loadingDeudas || (isFetchingDeudas && allEmpresas.length === 0)) ? (
          <div
            ref={tableContainerRef}
            className="flex-1 overflow-y-auto overflow-x-auto min-h-0"
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <div className="flex justify-center">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Facturado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Vencimiento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deuda
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.from({ length: 10 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        <div className="w-4 h-4 bg-gray-200 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-28" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-24" />
                        <div className="h-3 bg-gray-100 rounded w-16" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        <div className="w-6 h-6 bg-gray-200 rounded" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : allEmpresas.length === 0 && !loadingDeudas && !isFetchingDeudas ? (
          <div className="flex items-center justify-center py-12 flex-1">
            <div className="text-gray-500">No hay empresas para mostrar</div>
            <div className="text-xs text-gray-400 mt-2">
              Debug: deudasActivasData = {JSON.stringify(deudasActivasData, null, 2)}
            </div>
          </div>
        ) : (
          <div
            ref={tableContainerRef}
            className="flex-1 overflow-y-auto overflow-x-auto min-h-0"
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={isAllSelected}
                        onChange={() => handleSelectAll()}
                        containerClassName=""
                      />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('razsoc')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Nombre Cliente</span>
                      {sortBy === 'razsoc' ? (
                        sortOrder === 'asc' ? (
                          <ChevronUpIcon color="#6B7280" />
                        ) : (
                          <DropdownIcon color="#6B7280" />
                        )
                      ) : (
                        <DropdownIcon color="#9CA3AF" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('total_deuda')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Total Facturado</span>
                      {sortBy === 'total_deuda' ? (
                        sortOrder === 'asc' ? (
                          <ChevronUpIcon color="#6B7280" />
                        ) : (
                          <DropdownIcon color="#6B7280" />
                        )
                      ) : (
                        <DropdownIcon color="#9CA3AF" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('vencimiento')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Fecha Vencimiento</span>
                      {sortBy === 'vencimiento' ? (
                        sortOrder === 'asc' ? (
                          <ChevronUpIcon color="#6B7280" />
                        ) : (
                          <DropdownIcon color="#6B7280" />
                        )
                      ) : (
                        <DropdownIcon color="#9CA3AF" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('deuda')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Deuda</span>
                      {sortBy === 'deuda' ? (
                        sortOrder === 'asc' ? (
                          <ChevronUpIcon color="#6B7280" />
                        ) : (
                          <DropdownIcon color="#6B7280" />
                        )
                      ) : (
                        <DropdownIcon color="#9CA3AF" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allEmpresas.map((empresa) => {
                  const isSelected = empresa.rut ? selectedCompanies.has(empresa.rut) : false;
                  const documentos = empresa.documentos || [];
                  
                  // Si no hay documentos, no renderizar nada
                  if (documentos.length === 0) {
                    return null;
                  }
                  
                  // Usar la fecha de vencimiento más reciente del backend si está disponible
                  const fechaVencimientoMasReciente = empresa.vencimientoMasReciente 
                    ? new Date(empresa.vencimientoMasReciente)
                    : null;
                  
                  // Determinar si la empresa tiene documentos "Por vencer" o "Vencido"
                  // Si hay al menos un documento con dias_vencidos < 0, es "Por vencer"
                  // Si todos los documentos tienen dias_vencidos >= 0, es "Vencido"
                  const tieneDocumentosPorVencer = documentos.some(doc => 
                    doc.dias_vencidos !== null && doc.dias_vencidos !== undefined && doc.dias_vencidos < 0
                  );
                  
                  // Color de la deuda: verde si hay documentos por vencer, rojo si están vencidos
                  const deudaColor = tieneDocumentosPorVencer ? 'text-green-600' : 'text-red-600';
                  
                  return (
                    <tr key={empresa.rut} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => {
                              if (empresa.rut) {
                                handleRowToggle({ rut: empresa.rut } as CtasPorCobrar);
                              }
                            }}
                            containerClassName=""
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <p className="font-bold text-gray-900">{empresa.razsoc || '-'}</p>
                          <p className="text-xs text-gray-500">RUT: {empresa.rut || '-'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(empresa.total_deuda)}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <p className="font-medium text-gray-900">
                          {fechaVencimientoMasReciente ? formatDate(fechaVencimientoMasReciente.toISOString()) : '-'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <p className={`font-semibold ${deudaColor}`}>
                          {formatCurrency(empresa.total_deuda)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {tieneDocumentosPorVencer ? 'Por vencer' : 'Vencido'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <ActionsMenu
                          items={[
                            {
                              id: 'enviar-mail',
                              label: 'Enviar mail',
                              onClick: () => {
                                console.log('Enviar mail a:', empresa.cliente_email);
                              },
                              icon: <EmailIcon color="#6B7280" />
                            },
                            {
                              id: 'ver-detalle',
                              label: 'Ver detalle',
                              onClick: () => {
                                console.log('Ver detalle de empresa:', empresa);
                              },
                              icon: <EyeIcon color="#6B7280" />
                            },
                            {
                              id: 'automatizar-notificacion',
                              label: 'Automatizar notificación',
                              onClick: () => {
                                // Seleccionar automáticamente la empresa de esta fila
                                setSelectedCompanies(new Set([empresa.rut]));
                                // Abrir el modal de automatización
                                setIsAutomationModalOpen(true);
                              },
                              icon: <AutomationIcon color="#6B7280" />
                            }
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-4">
                <div className="text-sm text-gray-500">Cargando más registros...</div>
              </div>
            )}
            {!hasNextPage && allEmpresas.length > 0 && (
              <div className="flex items-center justify-center py-4">
                <div className="text-sm text-gray-500">No hay más empresas</div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Modal de Automatizar notificación/es */}
      <Modal
        isOpen={isAutomationModalOpen}
        onClose={() => {
          setIsAutomationModalOpen(false);
          // No limpiar selecciones al cerrar - mantener sincronización
        }}
        contentClassName="max-w-4xl"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Automatizar notificación/es</h2>
            <button
              onClick={() => {
                setIsAutomationModalOpen(false);
                // No limpiar selecciones al cerrar - mantener sincronización
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <p className="text-gray-600">
              Configura la automatización de cobros para enviar recordatorios de forma automática según las reglas que definas.
            </p>
            
            {/* Buscador de empresas */}
            <AutomationCompanySearch
              deudasData={allDeudas}
              selectedCompanies={Array.from(selectedCompanies)}
              onSelectionChange={handleCompaniesSelectionChange}
              automationConfig={automationConfig}
              onAutomationConfigChange={setAutomationConfig}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setIsAutomationModalOpen(false);
                // No limpiar selecciones al cerrar - mantener sincronización
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                console.log('Guardar automatización');
                setIsAutomationModalOpen(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

