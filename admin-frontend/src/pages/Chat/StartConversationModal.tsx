import { useState, type ChangeEvent } from 'react';
import { Modal, Input, Button } from '../../components/commons';
import { SearchIcon } from '../../components/commons';

interface User {
  id: number;
  email: string;
  name: string | null;
}

interface StartConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (userId: number) => void;
  users: User[];
  isLoading: boolean;
  currentUserId: number | null;
}

/**
 * Modal para buscar y seleccionar un contacto para iniciar conversación
 * @param props - Props del componente
 * @returns Componente StartConversationModal
 */
export const StartConversationModal = ({
  isOpen,
  onClose,
  onSelectUser,
  users,
  isLoading,
  currentUserId
}: StartConversationModalProps): React.ReactElement => {
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Filtra usuarios según el término de búsqueda
   */
  const filteredUsers = users.filter((user) => {
    if (user.id === currentUserId) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const emailMatch = user.email.toLowerCase().includes(searchLower);
    const nameMatch = user.name?.toLowerCase().includes(searchLower) ?? false;
    
    return emailMatch || nameMatch;
  });

  /**
   * Maneja la selección de un usuario
   */
  const handleSelectUser = async (userId: number): Promise<void> => {
    setSearchTerm('');
    try {
      await onSelectUser(userId);
      onClose();
    } catch (error) {
      console.error('Error al seleccionar usuario:', error);
    }
  };

  /**
   * Maneja el cierre del modal
   */
  const handleClose = (): void => {
    setSearchTerm('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} contentClassName="max-w-lg">
      <div className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Iniciar conversación</h2>
          <p className="text-sm text-gray-500">Busca un contacto para iniciar una nueva conversación</p>
        </div>

        <div className="mb-4">
          <Input
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o email..."
            leftIcon={<SearchIcon />}
            inputClassName="w-full"
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Cargando contactos...</div>
          ) : filteredUsers.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{user.name || user.email}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </button>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="p-4 text-center text-gray-500">
              No se encontraron contactos con "{searchTerm}"
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">No hay contactos disponibles</div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={handleClose} className="bg-gray-200 text-gray-800 hover:bg-gray-300">
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

