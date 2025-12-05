import { type APIGatewayProxyWebsocketEventV2 } from 'aws-lambda';
import { AuthService } from '../../../Users/services/AuthService';
import { UsersService } from '../../../Users/services/UsersService';
import { WebSocketConnectionRepository } from '../../repositories/WebSocketConnectionRepository';

/**
 * Servicio para autenticación de conexiones WebSocket
 */
export class WebSocketAuthenticator {
  private authService: AuthService;
  private usersService: UsersService;
  private connectionRepository: WebSocketConnectionRepository;

  constructor() {
    this.authService = new AuthService();
    this.usersService = new UsersService();
    this.connectionRepository = new WebSocketConnectionRepository();
  }

  /**
   * Autentica un usuario desde el token JWT en query params
   * @param event - Evento de WebSocket
   * @returns userId si la autenticación es exitosa, null en caso contrario
   */
  async authenticateFromToken(event: APIGatewayProxyWebsocketEventV2): Promise<number | null> {
    try {
      const queryParams = (event as unknown as { queryStringParameters?: Record<string, string> }).queryStringParameters ?? {};
      const token = queryParams.token;

      if (!token) {
        // Si no hay token, intentar usar userId directamente (para desarrollo)
        const userIdParam = queryParams.userId;
        if (userIdParam) {
          const userId = parseInt(userIdParam, 10);
          if (!isNaN(userId)) {
            return userId;
          }
        }
        return null;
      }

      // Verificar token y obtener email
      const verifiedUser = await this.authService.verifyToken(token);
      
      // Buscar el userId en la base de datos usando el email
      const user = await this.usersService.getUserByEmail(verifiedUser.email, false);
      if (user) {
        return user.id;
      }

      // Si no existe el usuario, intentar usar userId de query params como fallback
      const userIdParam = queryParams.userId;
      if (userIdParam) {
        const userId = parseInt(userIdParam, 10);
        if (!isNaN(userId)) {
          return userId;
        }
      }

      return null;
    } catch (error) {
      console.error('Error autenticando usuario:', error);
      return null;
    }
  }

  /**
   * Obtiene el userId desde una conexión WebSocket existente
   * @param connectionId - ID de la conexión
   * @returns userId o null si no existe
   */
  async getUserIdFromConnection(connectionId: string): Promise<number | null> {
    return await this.connectionRepository.findUserIdByConnectionId(connectionId);
  }

  /**
   * Valida que un usuario tenga acceso a una conversación
   * @param conversationId - ID de la conversación
   * @param userId - ID del usuario
   * @returns true si el usuario tiene acceso
   */
  async validateConversationAccess(conversationId: number, userId: number): Promise<boolean> {
    const { ChatRepository } = await import('../../repositories/ChatRepository');
    const chatRepository = new ChatRepository();
    return await chatRepository.isParticipant(conversationId, userId);
  }
}

