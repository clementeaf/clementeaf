import { useState, useEffect } from 'react';
import { Modal, Button, Input } from '../../../components/commons';
import { useCreateBranch, useUpdateBranch } from '../../../hooks/useBranches';
import type { Branch, CreateBranchDto, UpdateBranchDto } from '../../../services/branchesService';
import { toast } from 'react-toastify';

/**
 * Props del modal de sucursal
 */
interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
  branch?: Branch | null;
  onSuccess?: () => void;
}

/**
 * Modal para crear o editar una sucursal
 */
export const BranchModal = ({
  isOpen,
  onClose,
  clientId,
  branch,
  onSuccess
}: BranchModalProps): React.ReactElement => {
  const isEditing = !!branch;

  const [nombre, setNombre] = useState<string>('');
  const [direccion, setDireccion] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [comuna, setComuna] = useState<string>('');
  const [codigoPostal, setCodigoPostal] = useState<string>('');
  const [contactoNombre, setContactoNombre] = useState<string>('');
  const [contactoTelefono, setContactoTelefono] = useState<string>('');
  const [contactoEmail, setContactoEmail] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createBranchMutation = useCreateBranch();
  const updateBranchMutation = useUpdateBranch();

  /**
   * Resetea el formulario cuando se abre/cierra o cambia la sucursal
   */
  useEffect(() => {
    if (isOpen) {
      if (branch) {
        setNombre(branch.nombre);
        setDireccion(branch.direccion || '');
        setRegion(branch.region || '');
        setComuna(branch.comuna || '');
        setCodigoPostal(branch.codigoPostal || '');
        setContactoNombre(branch.contactoNombre || '');
        setContactoTelefono(branch.contactoTelefono || '');
        setContactoEmail(branch.contactoEmail || '');
      } else {
        setNombre('');
        setDireccion('');
        setRegion('');
        setComuna('');
        setCodigoPostal('');
        setContactoNombre('');
        setContactoTelefono('');
        setContactoEmail('');
      }
      setErrors({});
    }
  }, [isOpen, branch]);

  /**
   * Valida el formulario
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing && branch) {
        const dto: UpdateBranchDto = {
          nombre: nombre.trim(),
          direccion: direccion.trim() || undefined,
          region: region.trim() || undefined,
          comuna: comuna.trim() || undefined,
          codigoPostal: codigoPostal.trim() || undefined,
          contactoNombre: contactoNombre.trim() || undefined,
          contactoTelefono: contactoTelefono.trim() || undefined,
          contactoEmail: contactoEmail.trim() || undefined
        };
        await updateBranchMutation.mutateAsync({ clientId, branchId: branch.id, dto });
        toast.success('Sucursal actualizada exitosamente');
      } else {
        const dto: CreateBranchDto = {
          clientId,
          nombre: nombre.trim(),
          direccion: direccion.trim() || undefined,
          region: region.trim() || undefined,
          comuna: comuna.trim() || undefined,
          codigoPostal: codigoPostal.trim() || undefined,
          contactoNombre: contactoNombre.trim() || undefined,
          contactoTelefono: contactoTelefono.trim() || undefined,
          contactoEmail: contactoEmail.trim() || undefined
        };
        await createBranchMutation.mutateAsync({ clientId, dto });
        toast.success('Sucursal creada exitosamente');
      }

      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || 
                          (error as { message?: string })?.message || 
                          'Error al guardar la sucursal';
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    }
  };

  const isSubmitting = createBranchMutation.isPending || updateBranchMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Sucursal' : 'Añadir Sucursal'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.submit}
          </div>
        )}

        <div>
          <Input
            id="nombre"
            label="Nombre de la Sucursal"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            error={errors.nombre}
            placeholder="Ej: Sucursal Centro"
          />
        </div>

        <div>
          <Input
            id="direccion"
            label="Dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            error={errors.direccion}
            placeholder="Calle y número"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              id="region"
              label="Región"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              error={errors.region}
              placeholder="Ej: Región Metropolitana"
            />
          </div>
          <div>
            <Input
              id="comuna"
              label="Comuna"
              value={comuna}
              onChange={(e) => setComuna(e.target.value)}
              error={errors.comuna}
              placeholder="Ej: Santiago"
            />
          </div>
        </div>

        <div>
          <Input
            id="codigoPostal"
            label="Código Postal"
            value={codigoPostal}
            onChange={(e) => setCodigoPostal(e.target.value)}
            error={errors.codigoPostal}
            placeholder="Ej: 8320000"
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Información de Contacto</h3>
          
          <div className="space-y-4">
            <div>
              <Input
                id="contactoNombre"
                label="Nombre del Contacto"
                value={contactoNombre}
                onChange={(e) => setContactoNombre(e.target.value)}
                error={errors.contactoNombre}
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  id="contactoTelefono"
                  label="Teléfono"
                  value={contactoTelefono}
                  onChange={(e) => setContactoTelefono(e.target.value)}
                  error={errors.contactoTelefono}
                  placeholder="Ej: +56 9 1234 5678"
                />
              </div>
              <div>
                <Input
                  id="contactoEmail"
                  label="Email"
                  type="email"
                  value={contactoEmail}
                  onChange={(e) => setContactoEmail(e.target.value)}
                  error={errors.contactoEmail}
                  placeholder="contacto@sucursal.cl"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="px-4 py-2 bg-[#004BB7] text-white hover:bg-[#003a94]"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

