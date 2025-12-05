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
      // En WebSocket v2, los query params pueden estar en diferentes lugares
      // Intentar múltiples formas de acceso
      let queryParams: Record<string, string> = {};
      
      // Forma 1: queryStringParameters directo
      if ((event as unknown as { queryStringParameters?: Record<string, string> }).queryStringParameters) {
        queryParams = (event as unknown as { queryStringParameters?: Record<string, string> }).queryStringParameters ?? {};
      }
      
      // Forma 2: Desde requestContext
      if (!queryParams || Object.keys(queryParams).length === 0) {
        const requestContext = event.requestContext as unknown as { 
          queryString?: string;
          authorizer?: Record<string, unknown>;
        };
        
        if (requestContext?.queryString) {
          // Parsear query string manualmente
          const params = new URLSearchParams(requestContext.queryString);
          queryParams = Object.fromEntries(params.entries());
        }
      }
      
      // Forma 3: Desde headers (si están disponibles)
      if (!queryParams || Object.keys(queryParams).length === 0) {
        const headers = (event as unknown as { headers?: Record<string, string> }).headers;
        if (headers) {
          // Buscar token en headers
          const authHeader = headers.Authorization || headers.authorization;
          if (authHeader?.startsWith('Bearer ')) {
            queryParams.token = authHeader.replace('Bearer ', '');
          }
        }
      }
      
      const token = queryParams.token;
      const userIdParam = queryParams.userId;

      console.log(`🔍 WebSocketAuthenticator - Query params encontrados: ${Object.keys(queryParams).length}, Token presente: ${!!token}, userId param: ${userIdParam}`);

      if (!token) {
        // Si no hay token, intentar usar userId directamente (para desarrollo)
        if (userIdParam) {
          const userId = parseInt(userIdParam, 10);
          if (!isNaN(userId)) {
            console.log(`✅ WebSocketAuthenticator - Usando userId directo: ${userId}`);
            return userId;
          }
        }
        console.warn('⚠️ WebSocketAuthenticator - No token ni userId válido');
        return null;
      }

      // Verificar token y obtener email
      console.log('🔍 WebSocketAuthenticator - Verificando token...');
      let verifiedUser;
      try {
        verifiedUser = await this.authService.verifyToken(token);
        console.log(`✅ WebSocketAuthenticator - Token verificado, email: ${verifiedUser.email}`);
      } catch (error) {
        console.error('❌ WebSocketAuthenticator - Error verificando token:', error);
        // Si falla la verificación del token, usar userId como fallback
        if (userIdParam) {
          const userId = parseInt(userIdParam, 10);
          if (!isNaN(userId)) {
            console.log(`⚠️ WebSocketAuthenticator - Usando userId como fallback: ${userId}`);
            return userId;
          }
        }
        return null;
      }
      
      // Buscar el userId en la base de datos usando el email
      console.log(`🔍 WebSocketAuthenticator - Buscando usuario por email: ${verifiedUser.email}`);
      try {
        const user = await this.usersService.getUserByEmail(verifiedUser.email, false);
        if (user) {
          console.log(`✅ WebSocketAuthenticator - Usuario encontrado: userId=${user.id}`);
          return user.id;
        }
        console.warn(`⚠️ WebSocketAuthenticator - Usuario no encontrado en BD para email: ${verifiedUser.email}`);
      } catch (error) {
        console.error('❌ WebSocketAuthenticator - Error buscando usuario en BD:', error);
        // Si falla la búsqueda en BD, usar userId como fallback
        if (userIdParam) {
          const userId = parseInt(userIdParam, 10);
          if (!isNaN(userId)) {
            console.log(`⚠️ WebSocketAuthenticator - Usando userId como fallback por error en BD: ${userId}`);
            return userId;
          }
        }
      }

      // Si no existe el usuario, intentar usar userId de query params como fallback
      if (userIdParam) {
        const userId = parseInt(userIdParam, 10);
        if (!isNaN(userId)) {
          console.log(`⚠️ WebSocketAuthenticator - Usando userId como último fallback: ${userId}`);
          return userId;
        }
      }

      console.error('❌ WebSocketAuthenticator - No se pudo autenticar: no hay userId válido');
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ WebSocketAuthenticator - Error autenticando usuario:', errorMessage, error);
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

