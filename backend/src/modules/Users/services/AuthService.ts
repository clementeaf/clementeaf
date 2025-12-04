import { User } from '../entities/User.entity';
import { type RegisterDto } from '../dto/RegisterDto';
import { type LoginDto } from '../dto/LoginDto';
import { CognitoService } from '../services/CognitoService';

/**
 * Tipo para usuario sin contraseña
 */
type UserWithoutPassword = Omit<User, 'password'>;

/**
 * Crea un objeto usuario mínimo compatible con la entidad User
 * @param email - Email del usuario
 * @param name - Nombre del usuario (opcional)
 * @returns Usuario sin contraseña
 */
const createMinimalUser = (email: string, name: string | null = null): UserWithoutPassword => {
  return {
    id: 0,
    email,
    name,
    roleId: null,
    role: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/**
 * Servicio de autenticación para usuarios
 */
export class AuthService {
  /**
   * Registra un nuevo usuario
   * @param registerDto - Datos de registro
   * @returns Usuario creado sin la contraseña
   */
  async register(registerDto: RegisterDto): Promise<UserWithoutPassword> {
    const cognito = new CognitoService();
    await cognito.signUp(registerDto);
    return createMinimalUser(registerDto.email, registerDto.name ?? null);
  }

  /**
   * Autentica un usuario y genera un token JWT
   * @param loginDto - Datos de login
   * @returns Token JWT, refresh token y datos del usuario
   */
  async login(loginDto: LoginDto): Promise<{ token: string; refreshToken: string; user: UserWithoutPassword }> {
    const cognito = new CognitoService();
    const { token, refreshToken, user } = await cognito.signIn(loginDto);
    return { token, refreshToken, user: createMinimalUser(user.email, null) };
  }

  /**
   * Refresca el access token usando un refresh token
   * @param refreshToken - Refresh token
   * @returns Nuevo access token, refresh token y datos del usuario
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string; user: UserWithoutPassword }> {
    const cognito = new CognitoService();
    const { token, refreshToken: newRefreshToken, user } = await cognito.refreshToken({ refreshToken });
    return { token, refreshToken: newRefreshToken, user: createMinimalUser(user.email, null) };
  }

  /**
   * Verifica un token JWT y devuelve el usuario
   * @param token - Token JWT
   * @returns Usuario autenticado
   */
  async verifyToken(token: string): Promise<UserWithoutPassword> {
    const cognito = new CognitoService();
    const payload = await cognito.verifyToken(token);
    return createMinimalUser(payload.email, null);
  }

  /**
   * Cierra sesión (invalidar token si fuera necesario)
   * En este caso, solo verificamos que el token sea válido
   * @param token - Token JWT
   * @returns true si el token es válido
   */
  async logout(token: string): Promise<boolean> {
    try {
      const cognito = new CognitoService();
      await cognito.verifyToken(token);
      return true;
    } catch {
      return false;
    }
  }
}

