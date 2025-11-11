import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Modal } from '../../components/commons';
import { Input, Button, Select } from '../../components/commons';
import type { TicketType, TicketPriority } from './types';
import { ImageUpload } from './ImageUpload';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTicket: (ticket: {
    title: string;
    description: string;
    type: TicketType;
    priority: TicketPriority;
    images: File[];
  }) => void;
}

/**
 * Modal para crear un nuevo ticket
 * @param isOpen - Indica si el modal está abierto
 * @param onClose - Función para cerrar el modal
 * @param onCreateTicket - Función para crear el ticket
 * @returns Componente CreateTicketModal
 */
export const CreateTicketModal = ({ isOpen, onClose, onCreateTicket }: CreateTicketModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TicketType>('bug');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [images, setImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'El título es requerido';
    }
    
    if (!description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onCreateTicket({
      title: title.trim(),
      description: description.trim(),
      type,
      priority,
      images
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setType('bug');
    setPriority('medium');
    setImages([]);
    setErrors({});
    onClose();
  };

  const handleClose = (): void => {
    setTitle('');
    setDescription('');
    setType('bug');
    setPriority('medium');
    setImages([]);
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} contentClassName="max-w-2xl">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Crear Nuevo Ticket</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Título"
              value={title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setTitle(e.target.value);
                if (errors.title) {
                  setErrors({ ...errors, title: '' });
                }
              }}
              placeholder="Ej: Error al guardar cliente"
              error={errors.title}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                setDescription(e.target.value);
                if (errors.description) {
                  setErrors({ ...errors, description: '' });
                }
              }}
              placeholder="Describe el problema o la optimización solicitada..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              required
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select
                label="Tipo"
                value={type}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setType(e.target.value as TicketType)}
                options={[
                  { value: 'bug', label: 'Bug' },
                  { value: 'optimization', label: 'Optimización' },
                  { value: 'feature', label: 'Feature' }
                ]}
                placeholder="Selecciona categoría"
              />
            </div>
            
            <div>
              <Select
                label="Prioridad"
                value={priority}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setPriority(e.target.value as TicketPriority)}
                options={[
                  { value: 'low', label: 'Baja' },
                  { value: 'medium', label: 'Media' },
                  { value: 'high', label: 'Alta' },
                  { value: 'critical', label: 'Crítica' }
                ]}
                placeholder="Selecciona categoría"
              />
            </div>
          </div>

          <div>
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={5}
              maxSizeMB={10}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Crear Ticket
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

