import { useState } from 'react';
import { Button } from '../components/commons';
import { useWhatsAppStatus, useConnectWhatsApp, useDisconnectWhatsApp, useSendWhatsAppMessage, useSendWhatsAppImage } from '../hooks/useWhatsApp';

/**
 * Página de gestión de WhatsApp
 * @returns Componente WhatsApp
 */
export const WhatsApp = () => {
  const { data: status, isLoading } = useWhatsAppStatus();
  const connectMutation = useConnectWhatsApp();
  const disconnectMutation = useDisconnectWhatsApp();
  const sendMessageMutation = useSendWhatsAppMessage();
  const sendImageMutation = useSendWhatsAppImage();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');

  const handleConnect = (): void => {
    connectMutation.mutate();
  };

  const handleDisconnect = (): void => {
    disconnectMutation.mutate();
  };

  const handleSendMessage = (): void => {
    if (!phoneNumber || !message) {
      return;
    }
    sendMessageMutation.mutate({ to: phoneNumber, message });
    setMessage('');
  };

  const handleSendImage = (): void => {
    if (!phoneNumber || !imageUrl) {
      return;
    }
    sendImageMutation.mutate({ to: phoneNumber, imageUrl, caption: caption || undefined });
    setImageUrl('');
    setCaption('');
  };

  const getStatusColor = (status?: string): string => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'connecting':
      case 'authenticating':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'disconnected':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status?: string): string => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return 'Conectando...';
      case 'authenticating':
        return 'Autenticando...';
      case 'disconnected':
      default:
        return 'Desconectado';
    }
  };

  return (
    <div className="w-full h-full p-6 overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">WhatsApp</h1>
        <p className="text-gray-600">Gestiona la conexión y envía mensajes por WhatsApp</p>
      </div>

      <div className="mt-6 space-y-6">
        {/* Estado de Conexión */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Estado de Conexión</h2>
          
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Estado:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status?.status)}`}>
                  {getStatusText(status?.status)}
                </span>
              </div>

              {status?.phoneNumber && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Número:</span>
                  <span className="text-sm text-gray-600">{status.phoneNumber}</span>
                </div>
              )}

              {status?.qrCode && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    Escanea el QR Code que aparece en la terminal del servidor para autenticarte.
                  </p>
                  <img src={status.qrCode} alt="QR Code" className="max-w-xs mx-auto" />
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <Button
                  onClick={handleConnect}
                  disabled={connectMutation.isPending || status?.status === 'connected' || status?.status === 'connecting'}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {connectMutation.isPending ? 'Conectando...' : 'Conectar'}
                </Button>
                <Button
                  onClick={handleDisconnect}
                  disabled={disconnectMutation.isPending || status?.status === 'disconnected'}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {disconnectMutation.isPending ? 'Desconectando...' : 'Desconectar'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Enviar Mensaje de Texto */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Enviar Mensaje de Texto</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de teléfono
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="1234567890"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending || !phoneNumber || !message || status?.status !== 'connected'}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {sendMessageMutation.isPending ? 'Enviando...' : 'Enviar Mensaje'}
            </Button>
          </div>
        </div>

        {/* Enviar Imagen */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Enviar Imagen</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de teléfono
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="1234567890"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de la imagen
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caption (opcional)
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Descripción de la imagen"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button
              onClick={handleSendImage}
              disabled={sendImageMutation.isPending || !phoneNumber || !imageUrl || status?.status !== 'connected'}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {sendImageMutation.isPending ? 'Enviando...' : 'Enviar Imagen'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

