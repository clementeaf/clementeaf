import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { sum } from 'radashi';
import { cn } from '../utils/cn';
import { useQueryClient } from '@tanstack/react-query';
import {
  useEstadisticas,
  useDeudasActivasInfinite
} from '../hooks/useAnalytics';
import { CollectionsFilters } from './Collections/CollectionsFilters';
import { ActionsMenu, EyeIcon, EmailIcon, AutomationIcon, Modal, Checkbox, Button, Input } from '../components/commons';
import { AutomationCompanySearch } from './Collections/AutomationCompanySearch';
import type { QueryFilters, SortField, SortOrder, EmpresaConDocumentos } from '../types/analytics';
import type { CtasPorCobrar } from '../types/analytics';
import type { AutomationConfig } from './Collections/AutomationCompanySearch';
import { DropdownIcon, ChevronUpIcon, ChevronRightIcon } from '../components/commons/icons';
import { emailService, generateDebtNotificationEmail } from '../services/emailService';

/**
 * Página de Cuentas por Cobrar
 * @returns Componente Collections
 */
export const Collections = () => {
  const limit = 10;
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<Omit<QueryFilters, 'page' | 'limit'>>({});
  const [sortBy, setSortBy] = useState<SortField | undefined>('vencimiento');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
  const [isAutomationFromActionButton, setIsAutomationFromActionButton] = useState(false);
  const [isManualSendModalOpen, setIsManualSendModalOpen] = useState(false);
  const [manualSendEmail, setManualSendEmail] = useState('');
  const [isSendingManualEmail, setIsSendingManualEmail] = useState(false);
  const [manualSendResult, setManualSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isQuickActionsMenuOpen, setIsQuickActionsMenuOpen] = useState(false);
  const quickActionsMenuRef = useRef<HTMLDivElement>(null);
  // Estado principal: empresas seleccionadas por RUT (sincronizado entre tabla y modal)
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  // Estado para empresas expandidas (acordeón)
  const [expandedEmpresas, setExpandedEmpresas] = useState<Set<string>>(new Set());
  // Estado para sucursales expandidas (Map<empresaRut, Set<sucursalRut>>)
  const [expandedSucursales, setExpandedSucursales] = useState<Map<string, Set<string>>>(new Map());
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
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [emailSendResults, setEmailSendResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

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
        first3Razsoc: allData.slice(0, 3).map((e: EmpresaConDocumentos | CtasPorCobrar) => {
          if ('razsoc' in e) {
            return e.razsoc || (e as CtasPorCobrar).rut || '';
          }
          return (e as CtasPorCobrar).rut || '';
        })
      });
    }

    // Verificar si la primera entrada tiene la estructura de EmpresaConDocumentos (tiene 'documentos' o 'sucursal')
    const firstItem = allData[0];
    const isEmpresaStructure = firstItem && typeof firstItem === 'object' && ('documentos' in firstItem || 'sucursal' in firstItem);

    if (isEmpresaStructure) {
      // Estructura nueva: ya viene agrupada por empresa y ordenada del backend
      // Puede tener 'sucursal' (array de sucursales) o 'documentos' (documentos directos)
      // NO reordenar aquí, el backend ya lo hizo
      return allData as EmpresaConDocumentos[];
    } else {
      // Estructura antigua: lista de documentos, necesitamos agrupar por empresa
      const empresasMap = new Map<string, EmpresaConDocumentos>();

      (allData as unknown as CtasPorCobrar[]).forEach((doc: CtasPorCobrar) => {
        if (!doc.rut) return;

        // Usar rutpadre si existe, sino usar rut
        const rutEmpresa = doc.rutpadre || doc.rut;

        if (!empresasMap.has(rutEmpresa)) {
          empresasMap.set(rutEmpresa, {
            rut: rutEmpresa,
            razsoc: doc.razsoc_padre || doc.razsoc || '',
            cliente_email: doc.cliente_email || null,
            cliente_telefono: doc.cliente_telefono || null,
            documentos: [],
            total_deuda: 0,
            total_documentos: 0,
            vencimientoMasReciente: null
          });
        }

        const empresa = empresasMap.get(rutEmpresa)!;
        if (!empresa.documentos) {
          empresa.documentos = [];
        }
        empresa.documentos.push(doc);
        // Convertir deuda a número si es string, o usar 0 si es null/undefined
        const deudaValue = typeof doc.deuda === 'string' ? parseFloat(doc.deuda) || 0 : (doc.deuda ?? 0);
        empresa.total_deuda += isNaN(deudaValue) ? 0 : deudaValue;
        empresa.total_documentos += 1;
      });

      // Calcular vencimientoMasReciente para cada empresa
      return Array.from(empresasMap.values()).map((empresa): EmpresaConDocumentos => {
        const documentos = empresa.documentos || [];
        const fechasVencimiento = documentos
          .map((doc: CtasPorCobrar) => doc.vencimiento ? new Date(doc.vencimiento) : null)
          .filter((date): date is Date => date !== null);

        const vencimientoMasReciente = fechasVencimiento.length > 0
          ? fechasVencimiento.sort((a, b) => b.getTime() - a.getTime())[0].toISOString()
          : null;

        return {
          ...empresa,
          documentos: documentos.length > 0 ? documentos : undefined,
          vencimientoMasReciente: vencimientoMasReciente || null
        };
      });
    }
  }, [deudasActivasData?.pages]);

  /**
   * Obtiene todos los documentos de todas las empresas (para compatibilidad con código existente)
   * Incluye documentos de sucursales si existen
   */
  const allDeudas = useMemo(() => {
    return allEmpresas.flatMap((empresa: EmpresaConDocumentos) => {
      // Si hay sucursales, obtener documentos de todas las sucursales
      if (empresa.sucursal && empresa.sucursal.length > 0) {
        return empresa.sucursal.flatMap((sucursal) => sucursal.documentos || []);
      }
      // Si no hay sucursales, obtener documentos directos
      return empresa.documentos || [];
    }).filter((deuda): deuda is CtasPorCobrar => deuda !== null && deuda !== undefined);
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

  /**
   * Obtiene todas las deudas de una empresa (incluyendo sucursales)
   */
  const getCompanyDebts = (companyRut: string): CtasPorCobrar[] => {
    const empresa = allEmpresas.find(emp => emp.rut === companyRut);
    if (!empresa) return [];

    const debts: CtasPorCobrar[] = [];

    // Agregar documentos de sucursales si existen
    if (empresa.sucursal && empresa.sucursal.length > 0) {
      empresa.sucursal.forEach(sucursal => {
        if (sucursal.documentos) {
          debts.push(...sucursal.documentos);
        }
      });
    }

    // Agregar documentos directos si existen
    if (empresa.documentos && empresa.documentos.length > 0) {
      debts.push(...empresa.documentos);
    }

    return debts;
  };

  /**
   * Envía notificación manual a una empresa con email personalizado
   */
  const handleSendManualNotification = async (): Promise<void> => {
    if (selectedCompanies.size === 0) {
      alert('Por favor, selecciona una empresa');
      return;
    }

    if (!manualSendEmail.trim()) {
      alert('Por favor, ingresa un email de destino');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(manualSendEmail.trim())) {
      alert('Por favor, ingresa un email válido');
      return;
    }

    setIsSendingManualEmail(true);
    setManualSendResult(null);

    try {
      // Obtener la primera empresa seleccionada (para envío manual, solo una)
      const selectedRut = Array.from(selectedCompanies)[0];
      const empresa = allEmpresas.find(emp => emp.rut === selectedRut);

      if (!empresa) {
        throw new Error('Empresa no encontrada');
      }

      const debts = getCompanyDebts(selectedRut);
      if (debts.length === 0) {
        throw new Error('La empresa no tiene documentos pendientes');
      }

      // Usar el servicio de email con el email personalizado
      const { subject, htmlBody, textBody } = generateDebtNotificationEmail(
        empresa.razsoc || 'Cliente',
        empresa.rut,
        debts
      );

      await emailService.sendEmail({
        to: manualSendEmail.trim(),
        subject,
        body: textBody,
        htmlBody
      });

      setManualSendResult({
        success: true,
        message: `Notificación enviada exitosamente a ${manualSendEmail.trim()} `
      });

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setIsManualSendModalOpen(false);
        setManualSendEmail('');
        setManualSendResult(null);
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al enviar correo';
      setManualSendResult({
        success: false,
        message: errorMessage
      });
    } finally {
      setIsSendingManualEmail(false);
    }
  };

  /**
   * Envía notificaciones de deudas a las empresas seleccionadas
   */
  const handleSendNotifications = async (): Promise<void> => {
    if (selectedCompanies.size === 0) {
      alert('Por favor, selecciona al menos una empresa');
      return;
    }

    setIsSendingEmails(true);
    setEmailSendResults(null);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    try {
      const selectedRuts = Array.from(selectedCompanies);

      for (const rut of selectedRuts) {
        const empresa = allEmpresas.find(emp => emp.rut === rut);
        if (!empresa) {
          results.failed++;
          results.errors.push(`Empresa con RUT ${rut} no encontrada`);
          continue;
        }

        if (!empresa.cliente_email) {
          results.failed++;
          results.errors.push(`${empresa.razsoc || rut} no tiene email registrado`);
          continue;
        }

        const debts = getCompanyDebts(rut);
        if (debts.length === 0) {
          results.failed++;
          results.errors.push(`${empresa.razsoc || rut} no tiene documentos pendientes`);
          continue;
        }

        try {
          await emailService.sendDebtNotification(
            empresa.razsoc || 'Cliente',
            empresa.rut,
            empresa.cliente_email,
            debts
          );
          results.success++;
        } catch (error) {
          results.failed++;
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          results.errors.push(`${empresa.razsoc || rut}: ${errorMessage} `);
        }
      }

      setEmailSendResults(results);

      if (results.success > 0) {
        // Cerrar modal después de 2 segundos si hubo éxitos
        setTimeout(() => {
          setIsAutomationModalOpen(false);
          setEmailSendResults(null);
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al enviar correos';
      setEmailSendResults({
        success: 0,
        failed: selectedCompanies.size,
        errors: [errorMessage]
      });
    } finally {
      setIsSendingEmails(false);
    }
  };

  /**
   * Maneja el toggle de expansión de una empresa
   */
  const handleToggleEmpresa = (empresaRut: string): void => {
    setExpandedEmpresas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(empresaRut)) {
        newSet.delete(empresaRut);
      } else {
        newSet.add(empresaRut);
      }
      return newSet;
    });
  };

  /**
   * Maneja el toggle de expansión de una sucursal
   */
  const handleToggleSucursal = (empresaRut: string, sucursalRut: string): void => {
    setExpandedSucursales(prev => {
      const newMap = new Map(prev);
      const sucursalesSet = newMap.get(empresaRut) || new Set<string>();
      const newSucursalesSet = new Set(sucursalesSet);

      if (newSucursalesSet.has(sucursalRut)) {
        newSucursalesSet.delete(sucursalRut);
      } else {
        newSucursalesSet.add(sucursalRut);
      }

      if (newSucursalesSet.size > 0) {
        newMap.set(empresaRut, newSucursalesSet);
      } else {
        newMap.delete(empresaRut);
      }

      return newMap;
    });
  };

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
      {loadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0 mb-6">
          {/* Skeleton Total Documentos */}
          <div className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-8 bg-gray-300 rounded w-24"></div>
          </div>

          {/* Skeleton Deuda Total */}
          <div className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-300 rounded w-32"></div>
          </div>

          {/* Skeleton Documentos Activos */}
          <div className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-36 mb-4"></div>
            <div className="h-8 bg-gray-300 rounded w-24"></div>
          </div>

          {/* Skeleton Documentos Vencidos */}
          <div className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-36 mb-4"></div>
            <div className="h-8 bg-gray-300 rounded w-20"></div>
          </div>
        </div>
      ) : estadisticas ? (
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
      ) : null}

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
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Vencimiento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Facturado
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
                    <tr key={`skeleton - ${index} `} className="animate-pulse">
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center">
                          <div className="w-4 h-4 bg-gray-200 rounded" />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-100 rounded w-1/2" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-28" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-24" />
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
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
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
                  {allEmpresas.map((empresa: EmpresaConDocumentos) => {
                    const isSelected = empresa.rut ? selectedCompanies.has(empresa.rut) : false;
                    const isEmpresaExpanded = empresa.rut ? expandedEmpresas.has(empresa.rut) : false;
                    const sucursalesExpanded = empresa.rut ? expandedSucursales.get(empresa.rut) || new Set<string>() : new Set<string>();

                    // Obtener todos los documentos: de sucursales o directos
                    const documentos = empresa.sucursal && empresa.sucursal.length > 0
                      ? empresa.sucursal.flatMap((sucursal) => sucursal.documentos || [])
                      : (empresa.documentos || []);

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
                    const tieneDocumentosPorVencer = documentos.some((doc: CtasPorCobrar) =>
                      doc.dias_vencidos !== null && doc.dias_vencidos !== undefined && doc.dias_vencidos < 0
                    );

                    // Color de la deuda: verde si hay documentos por vencer, rojo si están vencidos
                    const deudaColor = tieneDocumentosPorVencer ? 'text-green-600' : 'text-red-600';

                    // Determinar si la empresa tiene sucursales
                    const tieneSucursales = empresa.sucursal && empresa.sucursal.length > 0;
                    // Determinar si la empresa tiene documentos directos (sin sucursales)
                    const tieneDocumentosDirectos = !tieneSucursales && empresa.documentos && empresa.documentos.length > 0;
                    // Mostrar flecha si tiene sucursales o documentos directos
                    const mostrarFlecha = tieneSucursales || tieneDocumentosDirectos;

                    return (
                      <React.Fragment key={empresa.rut}>
                        {/* Fila de empresa */}
                        <tr className={`hover: bg - gray - 50 ${isSelected ? 'bg-blue-50' : ''} `}>
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
                          <td className="px-4 py-3 text-center">
                            {mostrarFlecha && (
                              <button
                                onClick={() => empresa.rut && handleToggleEmpresa(empresa.rut)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                aria-label={isEmpresaExpanded ? 'Colapsar' : 'Expandir'}
                              >
                                {isEmpresaExpanded ? (
                                  <ChevronUpIcon color="#6B7280" />
                                ) : (
                                  <ChevronRightIcon color="#6B7280" />
                                )}
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div>
                              <p className="font-bold text-gray-900">{empresa.razsoc || '-'}</p>
                              <p className="text-xs text-gray-500">RUT: {empresa.rut || '-'}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <p className="font-medium text-gray-900">
                              {fechaVencimientoMasReciente ? formatDate(fechaVencimientoMasReciente.toISOString()) : '-'}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(empresa.total_deuda)}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <p className={`font - semibold ${deudaColor} `}>
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
                                  id: 'enviar-notificacion-manual',
                                  label: 'Enviar notificación manual',
                                  onClick: () => {
                                    // Seleccionar automáticamente la empresa de esta fila
                                    setSelectedCompanies(new Set([empresa.rut]));
                                    // Prellenar el email con el email registrado de la empresa
                                    setManualSendEmail(empresa.cliente_email || '');
                                    // Abrir el modal de envío manual
                                    setIsManualSendModalOpen(true);
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
                                    // Marcar que el modal se abrió desde el botón de acciones
                                    setIsAutomationFromActionButton(true);
                                    // Abrir el modal de automatización
                                    setIsAutomationModalOpen(true);
                                  },
                                  icon: <AutomationIcon color="#6B7280" />
                                }
                              ]}
                            />
                          </td>
                        </tr>

                        {/* Filas de sucursales (si la empresa está expandida y tiene sucursales) */}
                        {isEmpresaExpanded && tieneSucursales && empresa.sucursal && empresa.sucursal.map((sucursal) => {
                          const isSucursalExpanded = sucursalesExpanded.has(sucursal.rut);
                          const sucursalDocumentos = sucursal.documentos || [];
                          const sucursalTieneDocumentosPorVencer = sucursalDocumentos.some((doc: CtasPorCobrar) =>
                            doc.dias_vencidos !== null && doc.dias_vencidos !== undefined && doc.dias_vencidos < 0
                          );
                          const sucursalDeudaColor = sucursalTieneDocumentosPorVencer ? 'text-green-600' : 'text-red-600';
                          const sucursalFechaVencimiento = sucursal.vencimientoMasReciente
                            ? new Date(sucursal.vencimientoMasReciente)
                            : null;
                          const isSucursalSelected = selectedCompanies.has(sucursal.rut || '');

                          return (
                            <React.Fragment key={sucursal.rut}>
                              {/* Fila de sucursal */}
                              <tr className={`bg - gray - 50 hover: bg - gray - 100 ${isSucursalSelected ? 'bg-blue-100' : ''} `}>
                                <td className="px-4 py-3 text-center">
                                  <div className="flex justify-center">
                                    <Checkbox
                                      checked={isSucursalSelected}
                                      onChange={() => {
                                        if (sucursal.rut) {
                                          handleRowToggle({ rut: sucursal.rut } as CtasPorCobrar);
                                        }
                                      }}
                                      containerClassName=""
                                    />
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => empresa.rut && handleToggleSucursal(empresa.rut, sucursal.rut)}
                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    aria-label={isSucursalExpanded ? 'Colapsar' : 'Expandir'}
                                  >
                                    {isSucursalExpanded ? (
                                      <ChevronUpIcon color="#6B7280" />
                                    ) : (
                                      <ChevronRightIcon color="#6B7280" />
                                    )}
                                  </button>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <div className="pl-6">
                                    <p className="font-semibold text-gray-700">
                                      {sucursal.razsoc || `Sucursal ${sucursal.ultimos_digitos || ''} `}
                                    </p>
                                    <p className="text-xs text-gray-500">RUT: {sucursal.rut}</p>
                                    {sucursal.ultimos_digitos && (
                                      <p className="text-xs text-gray-400">Código: {sucursal.ultimos_digitos}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <p className="font-medium text-gray-700">
                                    {sucursalFechaVencimiento ? formatDate(sucursalFechaVencimiento.toISOString()) : '-'}
                                  </p>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <p className="font-semibold text-gray-700">
                                    {formatCurrency(sucursal.total_deuda)}
                                  </p>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <p className={`font - semibold ${sucursalDeudaColor} `}>
                                    {formatCurrency(sucursal.total_deuda)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {sucursalTieneDocumentosPorVencer ? 'Por vencer' : 'Vencido'}
                                  </p>
                                </td>
                                <td className="px-4 py-3 text-sm text-center"></td>
                              </tr>

                              {/* Filas de documentos de la sucursal (si está expandida) */}
                              {isSucursalExpanded && sucursalDocumentos.map((doc: CtasPorCobrar) => {
                                const docFechaVencimiento = doc.vencimiento ? new Date(doc.vencimiento) : null;
                                const docTieneDocumentosPorVencer = doc.dias_vencidos !== null && doc.dias_vencidos !== undefined && doc.dias_vencidos < 0;
                                const docDeudaColor = docTieneDocumentosPorVencer ? 'text-green-600' : 'text-red-600';

                                const isDocSelected = selectedCompanies.has(doc.rut || '');

                                return (
                                  <tr key={`${doc.td} -${doc.numdocto} `} className={`bg - gray - 100 hover: bg - gray - 200 ${isDocSelected ? 'bg-blue-50' : ''} `}>
                                    <td className="px-4 py-3 text-center">
                                      <div className="flex justify-center">
                                        <Checkbox
                                          checked={isDocSelected}
                                          onChange={() => {
                                            if (doc.rut) {
                                              handleRowToggle(doc);
                                            }
                                          }}
                                          containerClassName=""
                                        />
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      {/* Sin flecha para documentos */}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      <div className="pl-12">
                                        <p className="font-medium text-gray-600">
                                          {doc.td} {doc.numdocto}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {doc.fecha ? formatDate(doc.fecha) : '-'}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      <p className="font-medium text-gray-600">
                                        {docFechaVencimiento ? formatDate(docFechaVencimiento.toISOString()) : '-'}
                                      </p>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      <p className="font-medium text-gray-600">
                                        {formatCurrency(doc.deuda)}
                                      </p>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      <p className={`font - semibold ${docDeudaColor} `}>
                                        {formatCurrency(doc.deuda)}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {docTieneDocumentosPorVencer ? 'Por vencer' : 'Vencido'}
                                      </p>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center"></td>
                                  </tr>
                                );
                              })}
                            </React.Fragment>
                          );
                        })}

                        {/* Filas de documentos directos (si no hay sucursales y la empresa está expandida) */}
                        {isEmpresaExpanded && !tieneSucursales && empresa.documentos && empresa.documentos.map((doc: CtasPorCobrar) => {
                          const docFechaVencimiento = doc.vencimiento ? new Date(doc.vencimiento) : null;
                          const docTieneDocumentosPorVencer = doc.dias_vencidos !== null && doc.dias_vencidos !== undefined && doc.dias_vencidos < 0;
                          const docDeudaColor = docTieneDocumentosPorVencer ? 'text-green-600' : 'text-red-600';
                          const isDocSelected = selectedCompanies.has(doc.rut || '');

                          return (
                            <tr key={`${doc.td} -${doc.numdocto} `} className={cn("bg-gray-50 hover:bg-gray-100", isDocSelected && "bg-blue-50")}>
                              <td className="px-4 py-3 text-center">
                                <div className="flex justify-center">
                                  <Checkbox
                                    checked={isDocSelected}
                                    onChange={() => {
                                      if (doc.rut) {
                                        handleRowToggle(doc);
                                      }
                                    }}
                                    containerClassName=""
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {/* Sin flecha para documentos */}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div className="pl-6">
                                  <p className="font-medium text-gray-600">
                                    {doc.td} {doc.numdocto}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {doc.fecha ? formatDate(doc.fecha) : '-'}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <p className="font-medium text-gray-600">
                                  {docFechaVencimiento ? formatDate(docFechaVencimiento.toISOString()) : '-'}
                                </p>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <p className="font-medium text-gray-600">
                                  {formatCurrency(doc.deuda)}
                                </p>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <p className={cn("font-semibold", docDeudaColor)}>
                                  {formatCurrency(doc.deuda)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {docTieneDocumentosPorVencer ? 'Por vencer' : 'Vencido'}
                                </p>
                              </td>
                              <td className="px-4 py-3 text-sm text-center"></td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
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
          setIsAutomationFromActionButton(false);
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
                setIsAutomationFromActionButton(false);
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
              hideSearch={isAutomationFromActionButton}
            />
          </div>

          {/* Resultados del envío */}
          {emailSendResults && (
            <div className={cn(
              "mt-4 p-4 rounded-lg",
              emailSendResults.failed === 0
                ? "bg-green-50 border border-green-200"
                : emailSendResults.success > 0
                  ? "bg-yellow-50 border border-yellow-200"
                  : "bg-red-50 border border-red-200"
            )}>
              <div className="flex items-start gap-3">
                {emailSendResults.failed === 0 ? (
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                <div className="flex-1">
                  <p className={cn(
                    "font-medium",
                    emailSendResults.failed === 0 ? "text-green-800" : "text-yellow-800"
                  )}>
                    {emailSendResults.failed === 0
                      ? `✅ ${emailSendResults.success} notificación${emailSendResults.success !== 1 ? 'es' : ''} enviada${emailSendResults.success !== 1 ? 's' : ''} exitosamente`
                      : `${emailSendResults.success} enviada${emailSendResults.success !== 1 ? 's' : ''}, ${emailSendResults.failed} fallida${emailSendResults.failed !== 1 ? 's' : ''} `
                    }
                  </p>
                  {emailSendResults.errors.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-700 list-disc list-inside space-y-1">
                      {emailSendResults.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {emailSendResults.errors.length > 5 && (
                        <li className="text-gray-500">... y {emailSendResults.errors.length - 5} error{emailSendResults.errors.length - 5 !== 1 ? 'es' : ''} más</li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-col gap-3">
              {automationConfig.autoSendEnabled && (
                <button
                  onClick={handleSendNotifications}
                  disabled={isSendingEmails || selectedCompanies.size === 0}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                >
                  {isSendingEmails ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Configurando...
                    </>
                  ) : (
                    <>
                      <AutomationIcon color="#FFFFFF" />
                      Configurar notificación
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de Envío Manual */}
      <Modal
        isOpen={isManualSendModalOpen}
        onClose={() => {
          setIsManualSendModalOpen(false);
          setManualSendEmail('');
          setManualSendResult(null);
        }}
        contentClassName="max-w-2xl"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Enviar notificación manual</h2>
            <button
              onClick={() => {
                setIsManualSendModalOpen(false);
                setManualSendEmail('');
                setManualSendResult(null);
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
            {selectedCompanies.size === 1 && (() => {
              const selectedRut = Array.from(selectedCompanies)[0];
              const empresa = allEmpresas.find(emp => emp.rut === selectedRut);
              const debts = empresa ? getCompanyDebts(selectedRut) : [];
              const totalDebt = sum(debts, debt => debt.deuda || 0);

              return empresa ? (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Información de la empresa</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Nombre:</span> {empresa.razsoc || '-'}</p>
                      <p><span className="font-medium">RUT:</span> {empresa.rut || '-'}</p>
                      <p><span className="font-medium">Email registrado:</span> {empresa.cliente_email || 'No registrado'}</p>
                      <p><span className="font-medium">Total documentos:</span> {debts.length}</p>
                      <p><span className="font-medium">Deuda total:</span> {formatCurrency(totalDebt)}</p>
                    </div>
                  </div>

                  <div>
                    <Input
                      type="email"
                      label="Email de destino"
                      placeholder="ejemplo@empresa.cl"
                      value={manualSendEmail}
                      onChange={(e) => setManualSendEmail(e.target.value)}
                      inputClassName="w-full"
                      disabled={isSendingManualEmail}
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Ingresa el email al que deseas enviar la notificación. Se enviará un correo con todos los documentos pendientes de esta empresa.
                    </p>
                  </div>

                  {manualSendResult && (
                    <div className={cn(
                      "p-4 rounded-lg",
                      manualSendResult.success
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    )}>
                      <div className="flex items-start gap-3">
                        {manualSendResult.success ? (
                          <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <p className={cn(
                          "font-medium",
                          manualSendResult.success ? "text-green-800" : "text-red-800"
                        )}>
                          {manualSendResult.message}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setIsManualSendModalOpen(false);
                        setManualSendEmail('');
                        setManualSendResult(null);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                      disabled={isSendingManualEmail}
                    >
                      {manualSendResult ? 'Cerrar' : 'Cancelar'}
                    </button>
                    <button
                      onClick={handleSendManualNotification}
                      disabled={isSendingManualEmail || !manualSendEmail.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSendingManualEmail ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <EmailIcon color="#FFFFFF" />
                          Enviar notificación
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : null;
            })()}
          </div>
        </div>
      </Modal>
    </div>
  );
};

