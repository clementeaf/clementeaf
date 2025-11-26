import { useState, useEffect } from 'react';
import { Input, CountrySelector, ClientSearchInput, type Country } from '../../../components/commons';
import { DropdownIcon } from '../../../components/commons/icons';
import { getCountryByCode } from '../../../components/commons/countries';
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
 * Componente Formulario de información del cliente para cotización (Paso 1)
 * @param props - Props del componente QuoteClientForm
 * @returns Componente QuoteClientForm
 */
export const QuoteClientForm = ({ onDataChange, initialData }: QuoteClientFormProps) => {
  const defaultCountry = getCountryByCode('CL');
  const [formData, setFormData] = useState<Record<string, string>>(
    initialData || {
      clienteNombre: '',
      direccionFacturacion: '',
      telefono: '',
      regionComunaCodigo: '',
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
   * Maneja la selección de un cliente desde el buscador
   */
  const handleClientSelect = (client: Client): void => {
    // Construir región/comuna/código postal
    const regionParts: string[] = [];
    if (client.regionFacturacion) regionParts.push(client.regionFacturacion);
    if (client.comunaFacturacion) regionParts.push(client.comunaFacturacion);
    if (client.codigoPostalFacturacion) regionParts.push(client.codigoPostalFacturacion);
    const regionComunaCodigo = regionParts.length > 0 ? regionParts.join(' / ') : '';

    const newData: Record<string, string> = {
      ...formData,
      clienteNombre: client.nombreCliente || client.razonSocial || '',
      direccionFacturacion: client.direccionFacturacion || '',
      telefono: '', // El teléfono del cliente se mantiene vacío ya que no existe en la entidad
      regionComunaCodigo: regionComunaCodigo,
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
        <div className="col-span-2">
          <ClientSearchInput
            id="clienteNombre"
            label="Nombre del cliente"
            value={formData.clienteNombre || ''}
            onChange={(value): void => handleFieldChange('clienteNombre', value)}
            onClientSelect={handleClientSelect}
            placeholder="Busca o selecciona un cliente existente"
            inputClassName="bg-white"
            error={errors.clienteNombre || undefined}
          />
        </div>

        <div>
          <Input
            id="direccionFacturacion"
            label="Dirección de facturación"
            type="text"
            value={formData.direccionFacturacion || ''}
            onChange={(e): void => handleFieldChange('direccionFacturacion', e.target.value)}
            placeholder="Av. Domingo Santa María 1946, Independencia"
            inputClassName="bg-white"
            error={errors.direccionFacturacion || undefined}
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
            id="regionComunaCodigo"
            label="Región / Comuna / Código postal"
            type="text"
            value={formData.regionComunaCodigo || ''}
            onChange={(e): void => handleFieldChange('regionComunaCodigo', e.target.value)}
            placeholder="Región Metropolitana / Independencia / 8340290"
            inputClassName="bg-white"
            error={errors.regionComunaCodigo || undefined}
          />
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

