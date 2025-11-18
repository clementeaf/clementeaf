import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import {
  useEstadisticas,
  useDeudasActivasInfinite
} from '../hooks/useAnalytics';
import { CollectionsFilters } from './Collections/CollectionsFilters';
import { ActionsMenu, EyeIcon, EmailIcon, AutomationIcon, Modal, Checkbox } from '../components/commons';
import { AutomationCompanySearch } from './Collections/AutomationCompanySearch';
import type { QueryFilters } from '../types/analytics';
import type { CtasPorCobrar } from '../types/analytics';
import type { AutomationConfig } from './Collections/AutomationCompanySearch';

/**
 * Página de Cuentas por Cobrar
 * @returns Componente Collections
 */
export const Collections = () => {
  const limit = 10;
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<Omit<QueryFilters, 'page' | 'limit'>>({});
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
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
  const {
    data: deudasActivasData,
    isLoading: loadingDeudas,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useDeudasActivasInfinite(limit, filters);

  /**
   * Efecto para resetear el scroll cuando cambian los filtros
   */
  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  }, [filters]);

  /**
   * Obtiene todas las deudas de todas las páginas cargadas
   */
  const allDeudas = useMemo(() => {
    if (!deudasActivasData?.pages || deudasActivasData.pages.length === 0) {
      return [];
    }
    
    // Mostrar todas las páginas que se han cargado
    return deudasActivasData.pages.flatMap(page => page.data);
  }, [deudasActivasData?.pages]);

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
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(value);
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
   * Determina el estado de pago basado en días vencidos
   * @param diasVencidos - Días vencidos
   * @returns String con el estado de pago
   */
  const getPaymentStatus = (diasVencidos: number | null): string => {
    if (diasVencidos === null || diasVencidos === undefined) return 'Pendiente';
    if (diasVencidos < 0) return 'Por vencer';
    if (diasVencidos === 0) return 'Vence hoy';
    if (diasVencidos <= 30) return 'Vencido';
    if (diasVencidos <= 60) return 'Vencido 30-60 días';
    return 'Vencido +60 días';
  };

  /**
   * Obtiene el color del badge según el estado de pago
   * @param diasVencidos - Días vencidos
   * @returns String con las clases CSS
   */
  const getStatusBadgeColor = (diasVencidos: number | null): string => {
    if (diasVencidos === null || diasVencidos === undefined) return 'bg-gray-100 text-gray-800';
    if (diasVencidos < 0) return 'bg-blue-100 text-blue-800';
    if (diasVencidos === 0) return 'bg-yellow-100 text-yellow-800';
    if (diasVencidos <= 30) return 'bg-orange-100 text-orange-800';
    if (diasVencidos <= 60) return 'bg-red-100 text-red-800';
    return 'bg-red-200 text-red-900';
  };

  /**
   * Obtiene el ID único de una fila
   */
  const getRowId = (deuda: CtasPorCobrar): string => {
    return `${deuda.td}-${deuda.numdocto}`;
  };

  /**
   * Obtiene todas las empresas únicas (RUTs) de las deudas visibles
   */
  const uniqueCompanyRuts = useMemo(() => {
    const ruts = new Set<string>();
    allDeudas.forEach(deuda => {
      if (deuda.rut) {
        ruts.add(deuda.rut);
      }
    });
    return Array.from(ruts);
  }, [allDeudas]);

  /**
   * Verifica si una fila está seleccionada (basado en si su empresa está seleccionada)
   */
  const isRowSelected = (deuda: CtasPorCobrar): boolean => {
    return deuda.rut ? selectedCompanies.has(deuda.rut) : false;
  };

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
              <h2 className="text-xl font-bold text-gray-800">Cuentas por Cobrar</h2>
              {selectedCompanies.size > 0 && (
                <div className="text-sm text-blue-600 font-medium">
                  {selectedCompanies.size} empresa{selectedCompanies.size !== 1 ? 's' : ''} seleccionada{selectedCompanies.size !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {allDeudas.length > 0 && (
                <div className="text-sm text-gray-500">
                  Mostrando {allDeudas.length} de {deudasActivasData?.pages[0]?.total || 0} registros
                </div>
              )}
              <ActionsMenu
                items={[
                  {
                    id: 'automatizar-cobros',
                    label: 'Automatizar cobros',
                    onClick: () => {
                      setIsAutomationModalOpen(true);
                    },
                    icon: <AutomationIcon color="#6B7280" />
                  }
                ]}
              />
            </div>
          </div>
        {loadingDeudas && allDeudas.length === 0 ? (
          <div className="flex items-center justify-center py-12 flex-1">
            <div className="text-gray-500">Cargando...</div>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha y Monto Factura
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Vencimiento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado de Pago
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mail
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allDeudas.map((deuda) => {
                  const rowId = getRowId(deuda);
                  const isSelected = isRowSelected(deuda);
                  return (
                    <tr key={rowId} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleRowToggle(deuda)}
                            containerClassName=""
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{deuda.razsoc || '-'}</p>
                        <p className="text-xs text-gray-500">RUT: {deuda.rut || '-'}</p>
                        <p className="text-xs text-gray-500">Doc: {deuda.td} {deuda.numdocto}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">
                          {deuda.fecha ? formatDate(deuda.fecha) : '-'}
                        </p>
                        <p className="text-sm font-semibold text-red-600">
                          {formatCurrency(deuda.deuda || 0)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">
                          {deuda.vencimiento ? formatDate(deuda.vencimiento) : '-'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {deuda.dias_vencidos !== null && deuda.dias_vencidos !== undefined
                            ? `${deuda.dias_vencidos} días ${deuda.dias_vencidos > 0 ? 'vencidos' : 'restantes'}`
                            : '-'
                          }
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(deuda.dias_vencidos)}`}>
                        {getPaymentStatus(deuda.dias_vencidos)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {deuda.cliente_email ? (
                        <span className="text-gray-900">{deuda.cliente_email}</span>
                      ) : (
                        <span className="text-gray-400 italic">No disponible</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {deuda.cliente_telefono ? (
                        <span className="text-gray-900">{deuda.cliente_telefono}</span>
                      ) : (
                        <span className="text-gray-400 italic">No disponible</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <ActionsMenu
                        items={[
                          {
                            id: 'enviar-mail',
                            label: 'Enviar mail',
                            onClick: () => {
                              console.log('Enviar mail a:', deuda.cliente_email);
                            },
                            icon: <EmailIcon color="#6B7280" />
                          },
                          {
                            id: 'ver-detalle',
                            label: 'Ver detalle',
                            onClick: () => {
                              console.log('Ver detalle de:', deuda);
                            },
                            icon: <EyeIcon color="#6B7280" />
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
            {!hasNextPage && allDeudas.length > 0 && (
              <div className="flex items-center justify-center py-4">
                <div className="text-sm text-gray-500">No hay más registros</div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Modal de Automatizar Cobros */}
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
            <h2 className="text-2xl font-bold text-gray-800">Automatizar Cobros</h2>
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

