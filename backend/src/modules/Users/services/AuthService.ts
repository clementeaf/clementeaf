import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../../../config/database';
import { User } from '../entities/User.entity';
import { type RegisterDto } from '../dto/RegisterDto';
import { type LoginDto } from '../dto/LoginDto';

const JWT_SECRET = process.env.JWT_SECRET ?? 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

/**
 * Servicio de autenticación para usuarios
 */
export class AuthService {
  private get userRepository() {
    return AppDataSource.getRepository(User);
  }

  /**
   * Registra un nuevo usuario
   * @param registerDto - Datos de registro
   * @returns Usuario creado sin la contraseña
   */
  async register(registerDto: RegisterDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name ?? null
    } as User);

    const savedUser = await this.userRepository.save(user);
    const { password: _password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as Omit<User, 'password'>;
  }

  /**
   * Autentica un usuario y genera un token JWT
   * @param loginDto - Datos de login
   * @returns Token JWT y datos del usuario
   */
  async login(loginDto: LoginDto): Promise<{ token: string; user: Omit<User, 'password'> }> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    const { password, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  /**
   * Verifica un token JWT y devuelve el usuario
   * @param token - Token JWT
   * @returns Usuario autenticado
   */
  async verifyToken(token: string): Promise<Omit<User, 'password'>> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };

      const user = await this.userRepository.findOne({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Cierra sesión (invalidar token si fuera necesario)
   * En este caso, solo verificamos que el token sea válido
   * @param token - Token JWT
   * @returns true si el token es válido
   */
  async logout(token: string): Promise<boolean> {
    try {
      jwt.verify(token, JWT_SECRET);
      return true;
    } catch {
      return false;
    }
  }
}

