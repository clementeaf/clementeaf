import { useState, type ChangeEvent } from 'react';

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

/**
 * Componente para cargar y previsualizar imágenes
 * @param images - Array de archivos de imagen seleccionados
 * @param onImagesChange - Función que se ejecuta cuando cambian las imágenes
 * @param maxImages - Número máximo de imágenes permitidas (default: 5)
 * @param maxSizeMB - Tamaño máximo por imagen en MB (default: 10)
 * @returns Componente ImageUpload
 */
export const ImageUpload = ({
  images,
  onImagesChange,
  maxImages = 5,
  maxSizeMB = 10
}: ImageUploadProps) => {
  const [error, setError] = useState<string>('');

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen');
      return false;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`El archivo no debe exceder ${maxSizeMB}MB`);
      return false;
    }

    return true;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setError('');
    const files = Array.from(e.target.files || []);

    if (images.length + files.length > maxImages) {
      setError(`Solo se pueden subir máximo ${maxImages} imágenes`);
      return;
    }

    const validFiles = files.filter(validateFile);
    
    if (validFiles.length !== files.length) {
      return;
    }

    onImagesChange([...images, ...validFiles]);
    e.target.value = '';
  };

  const removeImage = (index: number): void => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    setError('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Imágenes (opcional)
      </label>
      
      <div className="flex flex-wrap gap-2">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={URL.createObjectURL(image)}
              alt={`Preview ${index + 1}`}
              className="w-24 h-24 object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Eliminar imagen"
            >
              ×
            </button>
            <p className="text-xs text-gray-500 mt-1 text-center max-w-[96px] truncate">
              {image.name}
            </p>
          </div>
        ))}
        
        {images.length < maxImages && (
          <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-xs text-gray-500 mt-1">Agregar</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}

      <p className="text-xs text-gray-500">
        Máximo {maxImages} imágenes, {maxSizeMB}MB por imagen. Formatos: JPG, PNG, GIF, WebP
      </p>
    </div>
  );
};

