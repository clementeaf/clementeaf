import { useState } from 'react';
import type { TrainingRow } from './types';

/**
 * Props del componente VideoPlayer
 */
interface VideoPlayerProps {
  /**
   * Datos de la capacitación
   */
  training: TrainingRow;
  /**
   * Función para cerrar el reproductor
   */
  onClose: () => void;
}

/**
 * Componente para reproducir videos de capacitación
 * @param props - Props del componente VideoPlayer
 * @returns Componente VideoPlayer
 */
export const VideoPlayer = ({ training, onClose }: VideoPlayerProps): React.ReactElement => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handlePlay = (): void => {
    setIsPlaying(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">{training.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              aria-label="Cerrar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center relative overflow-hidden">
              {isPlaying ? (
                <video
                  src={training.videoUrl}
                  controls
                  className="w-full h-full"
                  onPlay={handlePlay}
                >
                  Tu navegador no soporta la reproducción de videos.
                </video>
              ) : (
                <div className="text-center">
                  {training.thumbnailUrl ? (
                    <img
                      src={training.thumbnailUrl}
                      alt={training.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <svg className="w-20 h-20 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                  <button
                    onClick={handlePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-opacity duration-200"
                    aria-label="Reproducir video"
                  >
                    <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Producto</h3>
              <p className="text-sm text-gray-900">{training.productName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Factura</h3>
              <p className="text-sm text-gray-900">{training.billNumber}</p>
            </div>
            {training.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Descripción</h3>
                <p className="text-sm text-gray-900">{training.description}</p>
              </div>
            )}
            {training.duration && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Duración</h3>
                <p className="text-sm text-gray-900">{training.duration}</p>
              </div>
            )}
            {training.progress !== undefined && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Progreso</h3>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${training.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">{training.progress}% completado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

