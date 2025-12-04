import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Select } from '../../components/commons';
import { usersService, type CreateUserDto } from '../../services/usersService';
import { rolesService, type Role } from '../../services/rolesService';
import { routes } from '../../routes';
import { toast } from 'react-toastify';
import ArrowRightIcon from '../../assets/right.png';

/**
 * Página de creación de usuario
 * @returns Componente CreateUser
 */
export const CreateUser = (): React.ReactElement => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<CreateUserDto>({
    email: '',
    password: '',
    name: '',
    roleId: null
  });

  /**
   * Carga los roles disponibles
   */
  useEffect(() => {
    loadRoles();
  }, []);

  /**
   * Carga los roles del sistema
   */
  const loadRoles = async (): Promise<void> => {
    try {
      const rolesData = await rolesService.getAllRoles();
      setRoles(rolesData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar roles';
      toast.error(errorMessage);
      console.error('Error loading roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Maneja la navegación de vuelta
   */
  const handleBack = (): void => {
    navigate(routes.users);
  };

  /**
   * Guarda el usuario
   */
  const handleSave = async (): Promise<void> => {
    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error('Email y contraseña son requeridos');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Email inválido');
      return;
    }

    // Validar contraseña (mínimo 6 caracteres)
    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setIsSaving(true);
      await usersService.createUser({
        email: formData.email.trim(),
        password: formData.password,
        name: formData.name?.trim() || undefined,
        roleId: formData.roleId || null
      });
      toast.success('Usuario creado exitosamente');
      navigate(routes.users);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear usuario';
      toast.error(errorMessage);
      console.error('Error creating user:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <div className="animate-pulse space-y-4 p-8">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-8 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Crear Usuario</h1>
            <nav className="text-sm text-gray-600 flex items-center gap-2">
              <button onClick={handleBack} className="hover:text-black">Usuarios</button>
              <img src={ArrowRightIcon} alt="Arrow right" className="w-4 h-4" />
              <span className="text-gray-800 font-medium">Crear Usuario</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl flex-1 flex flex-col overflow-hidden">
        <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <Input
              id="user-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="usuario@ejemplo.com"
              inputClassName="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña *
            </label>
            <Input
              id="user-password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Mínimo 6 caracteres"
              inputClassName="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              La contraseña debe tener al menos 6 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <Input
              id="user-name"
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nombre completo (opcional)"
              inputClassName="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <Select
              id="user-role"
              value={formData.roleId?.toString() || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, roleId: e.target.value ? parseInt(e.target.value, 10) : null }))}
              options={[
                { value: '', label: 'Sin rol' },
                ...roles.map(role => ({
                  value: role.id.toString(),
                  label: role.name
                }))
              ]}
            />
            {formData.roleId && (
              <p className="text-xs text-gray-500 mt-1">
                {roles.find(r => r.id === formData.roleId)?.description || ''}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t flex-shrink-0">
            <button
              onClick={handleSave}
              disabled={isSaving || !formData.email.trim() || !formData.password.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Creando...' : 'Crear Usuario'}
            </button>
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

