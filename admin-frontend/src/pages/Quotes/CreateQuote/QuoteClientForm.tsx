import { useState, useEffect, useMemo } from 'react';
import { Input, CountrySelector, ClientSearchInput, Select, type Country } from '../../../components/commons';
import { DropdownIcon } from '../../../components/commons/icons';
import { getCountryByCode } from '../../../components/commons/countries';
import { getAllRegions, getCommunesByRegion } from '../../../components/commons/chileRegions';
import type { Client } from '../../../services/clientsService';

/**
 * Props del componente QuoteClientForm
 */
interface QuoteClientFormProps {
  /**
   * Función para actualizar los datos del formulario
   */
  onDataChange?: (data: Record<string, string>) => void;
  /**
   * Datos iniciales del formulario
   */
  initialData?: Record<string, string>;
}

/**
 * Componente Formulario de información del cliente para orden de compra (Paso 1)
 * @param props - Props del componente QuoteClientForm
 * @returns Componente QuoteClientForm
 */
export const QuoteClientForm = ({ onDataChange, initialData }: QuoteClientFormProps) => {
  const defaultCountry = getCountryByCode('CL');
  const [formData, setFormData] = useState<Record<string, string>>(
    initialData || {
      clienteNombre: '',
      clienteRut: '',
      region: '',
      comuna: '',
      direccionDespacho: '',
      telefono: '',
      asesorAsignado: '',
      contactoNombre: '',
      contactoTelefono: '',
      contactoEmail: ''
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(defaultCountry);
  const [contactCountry, setContactCountry] = useState<Country | null>(defaultCountry);

  /**
   * Sincroniza el estado local con initialData cuando cambia
   */
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => {
        const hasChanges = Object.keys(initialData).some(
          key => prev[key] !== initialData[key]
        );
        return hasChanges ? { ...prev, ...initialData } : prev;
      });
      
      if (initialData.countryCode) {
        const country = getCountryByCode(initialData.countryCode);
        if (country) {
          setSelectedCountry(country);
        }
      }
      if (initialData.contactoCountryCode) {
        const country = getCountryByCode(initialData.contactoCountryCode);
        if (country) {
          setContactCountry(country);
        }
      }
    }
  }, [initialData]);

  /**
   * Maneja el cambio de un campo
   * @param fieldName - Nombre del campo
   * @param value - Nuevo valor
   */
  const handleFieldChange = (fieldName: string, value: string): void => {
    const newData = { ...formData, [fieldName]: value };
    setFormData(newData);
    
    if (onDataChange) {
      onDataChange(newData);
    }

    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  /**
   * Maneja el cambio del país seleccionado para teléfono del cliente
   */
  const handleCountryChange = (country: Country): void => {
    setSelectedCountry(country);
    const newData = { ...formData, countryCode: country.code, countryDialCode: country.dialCode };
    setFormData(newData);
    
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  /**
   * Maneja el cambio del país seleccionado para teléfono de contacto
   */
  const handleContactCountryChange = (country: Country): void => {
    setContactCountry(country);
    const newData = { ...formData, contactoCountryCode: country.code, contactoCountryDialCode: country.dialCode };
    setFormData(newData);
    
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  /**
   * Obtiene las comunas disponibles según la región seleccionada
   */
  const availableCommunes = useMemo(() => {
    if (!formData.region) {
      return [];
    }
    return getCommunesByRegion(formData.region);
  }, [formData.region]);

  /**
   * Maneja el cambio de región
   */
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newRegion = e.target.value;
    handleFieldChange('region', newRegion);
    // Limpiar comuna cuando cambia la región
    handleFieldChange('comuna', '');
  };

  /**
   * Maneja la selección de un cliente desde el buscador
   */
  const handleClientSelect = (client: Client): void => {
    // Mapear nombres de regiones a valores del selector
    const regionName = client.regionDespacho || client.regionFacturacion || '';
    const comunaName = client.comunaDespacho || client.comunaFacturacion || '';
    
    // Buscar el valor de la región por nombre (necesitamos mapear el nombre al value)
    const allRegions = getAllRegions();
    const matchedRegion = allRegions.find(r => 
      r.label.toLowerCase() === regionName.toLowerCase() || 
      r.value === regionName.toLowerCase().replace(/\s+/g, '_')
    );
    
    const regionValue = matchedRegion?.value || '';
    
    // Si encontramos la región, buscar la comuna
    let comunaValue = '';
    if (regionValue) {
      const communes = getCommunesByRegion(regionValue);
      const matchedCommune = communes.find(c => 
        c.label.toLowerCase() === comunaName.toLowerCase() ||
        c.value === comunaName.toLowerCase().replace(/\s+/g, '_')
      );
      comunaValue = matchedCommune?.value || '';
    }

    const newData: Record<string, string> = {
      ...formData,
      clienteNombre: client.nombreCliente || client.razonSocial || '',
      clienteRut: client.rut || '',
      region: regionValue,
      comuna: comunaValue,
      direccionDespacho: client.direccionDespacho || client.direccionFacturacion || '',
      telefono: '', // El teléfono del cliente se mantiene vacío ya que no existe en la entidad
      contactoNombre: client.contactoNombre || '',
      contactoEmail: client.contactoCorreoElectronico || '',
      contactoTelefono: client.contactoTelefono || '',
      countryCode: client.contactoCountryCode || 'CL',
      countryDialCode: client.contactoCountryDialCode || '+56',
      contactoCountryCode: client.contactoCountryCode || 'CL',
      contactoCountryDialCode: client.contactoCountryDialCode || '+56'
    };

    // Actualizar país seleccionado para teléfono de contacto si hay código de país
    if (client.contactoCountryCode) {
      const country = getCountryByCode(client.contactoCountryCode);
      if (country) {
        setContactCountry(country);
      }
    }

    setFormData(newData);
    
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  return (
    <div className="flex-1 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6">Información del cliente</h2>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <ClientSearchInput
            id="clienteNombre"
            label="Nombre del cliente"
            value={formData.clienteNombre || ''}
            onChange={(value): void => handleFieldChange('clienteNombre', value)}
            onClientSelect={handleClientSelect}
            placeholder="Busca por nombre"
            inputClassName="bg-white"
            error={errors.clienteNombre || undefined}
            searchType="nombre"
          />
        </div>
        <div>
          <ClientSearchInput
            id="clienteRut"
            label="RUT del cliente"
            value={formData.clienteRut || ''}
            onChange={(value): void => handleFieldChange('clienteRut', value)}
            onClientSelect={handleClientSelect}
            placeholder="Busca por RUT"
            inputClassName="bg-white"
            error={errors.clienteRut || undefined}
            searchType="rut"
          />
        </div>

        <div>
          <Select
            id="region"
            label="Región"
            value={formData.region || ''}
            onChange={handleRegionChange}
            options={getAllRegions()}
            placeholder="Selecciona una región"
            selectClassName="bg-white"
            error={errors.region || undefined}
          />
        </div>

        <div>
          <Select
            id="comuna"
            label="Comuna"
            value={formData.comuna || ''}
            onChange={(e): void => handleFieldChange('comuna', e.target.value)}
            options={availableCommunes}
            placeholder={formData.region ? "Selecciona una comuna" : "Primero selecciona una región"}
            selectClassName="bg-white"
            disabled={!formData.region}
            error={errors.comuna || undefined}
          />
        </div>

        <div>
          <Input
            id="direccionDespacho"
            label="Dirección de despacho"
            type="text"
            value={formData.direccionDespacho || ''}
            onChange={(e): void => handleFieldChange('direccionDespacho', e.target.value)}
            placeholder="Av. Domingo Santa María 1946"
            inputClassName="bg-white"
            error={errors.direccionDespacho || undefined}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
          <div className="flex gap-2">
            <CountrySelector
              value={formData.countryCode || 'CL'}
              onChange={handleCountryChange}
            />
            <Input
              id="telefono"
              label=""
              type="tel"
              value={formData.telefono || ''}
              onChange={(e): void => handleFieldChange('telefono', e.target.value)}
              placeholder="972169094"
              inputClassName="bg-white flex-1"
              error={errors.telefono || undefined}
            />
          </div>
        </div>

        <div>
          <Input
            id="asesorAsignado"
            label="Asesor asignado"
            type="text"
            value={formData.asesorAsignado || ''}
            onChange={(e): void => handleFieldChange('asesorAsignado', e.target.value)}
            placeholder="Nicolás Suazo"
            inputClassName="bg-white"
            rightIcon={<DropdownIcon color="#6b7280" />}
            error={errors.asesorAsignado || undefined}
          />
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Contacto</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Input
              id="contactoNombre"
              label="Nombre"
              type="text"
              value={formData.contactoNombre || ''}
              onChange={(e): void => handleFieldChange('contactoNombre', e.target.value)}
              placeholder="María González"
              inputClassName="bg-white"
              error={errors.contactoNombre || undefined}
            />
          </div>

          <div>
            <Input
              id="contactoEmail"
              label="Correo electrónico"
              type="email"
              value={formData.contactoEmail || ''}
              onChange={(e): void => handleFieldChange('contactoEmail', e.target.value)}
              placeholder="maria.gonzalez@empresa.cl"
              inputClassName="bg-white"
              error={errors.contactoEmail || undefined}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
            <div className="flex gap-2">
              <CountrySelector
                value={formData.contactoCountryCode || 'CL'}
                onChange={handleContactCountryChange}
              />
              <Input
                id="contactoTelefono"
                label=""
                type="tel"
                value={formData.contactoTelefono || ''}
                onChange={(e): void => handleFieldChange('contactoTelefono', e.target.value)}
                placeholder="000000000"
                inputClassName="bg-white flex-1"
                error={errors.contactoTelefono || undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

