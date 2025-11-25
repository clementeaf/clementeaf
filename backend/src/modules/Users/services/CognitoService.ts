// src/modules/Users/services/CognitoService.ts

/**
 * Wrapper simple para AWS Cognito User Pools usando el SDK v3.
 * Provee los métodos mínimos necesarios para la migración:
 *   - signUp (registro)
 *   - signIn (login) → devuelve el ID token (JWT) y atributos básicos del usuario
 *   - verifyToken (validación del JWT contra la JWKS pública de Cognito)
 *
 * En un proyecto real se debería manejar errores más finamente, refrescar tokens,
 * y mapear atributos personalizados. Aquí implementamos la lógica esencial para que
 * los handlers existentes puedan delegar en Cognito sin cambiar su firma pública.
 */

import {
    CognitoIdentityProviderClient,
    SignUpCommand,
    InitiateAuthCommand,
    AdminUpdateUserAttributesCommand,
    AdminConfirmSignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID, COGNITO_REGION, COGNITO_AUTO_CONFIRM } from '../../../config/cognito';
import { type RegisterDto } from '../dto/RegisterDto';
import { type LoginDto } from '../dto/LoginDto';
import { type RefreshTokenDto } from '../dto/RefreshTokenDto';
import * as jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

/**
 * Interfaz para JWK (JSON Web Key)
 */
interface JWK {
    kty: string;
    kid: string;
    use?: string;
    n: string;
    e: string;
}

/**
 * Interfaz para JWKS (JSON Web Key Set)
 */
interface JWKS {
    keys: JWK[];
}

/**
 * Interfaz para el header del JWT
 */
interface JWTHeader {
    kid: string;
    alg: string;
}

// Cliente Cognito configurado con la región del pool
const cognitoClient = new CognitoIdentityProviderClient({ region: COGNITO_REGION });

export class CognitoService {
    /**
     * Registra un nuevo usuario en el User Pool.
     * @param registerDto datos de registro (email, password, name opcional)
     * @returns objeto con sub (userId) y email
     */
    async signUp(registerDto: RegisterDto): Promise<{ sub: string; email: string }> {
        const signUpCommand = new SignUpCommand({
            ClientId: COGNITO_CLIENT_ID,
            Username: registerDto.email,
            Password: registerDto.password,
            UserAttributes: [
                { Name: 'email', Value: registerDto.email },
                ...(registerDto.name ? [{ Name: 'name', Value: registerDto.name }] : []),
            ],
        });
        const signUpResponse = await cognitoClient.send(signUpCommand);

        // Auto-confirmación siempre activada
        if (COGNITO_AUTO_CONFIRM) {
            // Marcar email como verificado
            const adminUpdateUserAttributesCommand = new AdminUpdateUserAttributesCommand({
                UserPoolId: COGNITO_USER_POOL_ID,
                Username: registerDto.email,
                UserAttributes: [
                    { Name: 'email_verified', Value: 'true' },
                ],
            });
            await cognitoClient.send(adminUpdateUserAttributesCommand);

            // Confirmar el usuario completamente
            const adminConfirmSignUpCommand = new AdminConfirmSignUpCommand({
                UserPoolId: COGNITO_USER_POOL_ID,
                Username: registerDto.email,
            });
            await cognitoClient.send(adminConfirmSignUpCommand);
        }

        return { sub: signUpResponse.UserSub || '', email: registerDto.email };
    }

    /**
     * Autentica al usuario y devuelve el ID token (JWT), refresh token y atributos básicos.
     * @param loginDto - Datos de login (email y password)
     * @returns Token ID, refresh token y datos del usuario
     */
    async signIn(loginDto: LoginDto): Promise<{ token: string; refreshToken: string; user: { sub: string; email: string } }> {
        const command = new InitiateAuthCommand({
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: COGNITO_CLIENT_ID,
            AuthParameters: {
                USERNAME: loginDto.email,
                PASSWORD: loginDto.password,
            },
        });
        const response = await cognitoClient.send(command);
        const idToken = response.AuthenticationResult?.IdToken;
        const refreshToken = response.AuthenticationResult?.RefreshToken;
        
        if (!idToken) {
            throw new Error('Invalid credentials');
        }
        if (!refreshToken) {
            throw new Error('Refresh token not provided');
        }
        
        // Decodificar sin verificar para extraer sub y email (verificación se hará en verifyToken)
        const decoded = jwt.decode(idToken) as { sub?: string; email?: string } | null;
        return {
            token: idToken,
            refreshToken,
            user: { sub: decoded?.sub ?? '', email: decoded?.email ?? '' },
        };
    }

    /**
     * Refresca el access token usando un refresh token
     * @param refreshTokenDto - DTO con el refresh token
     * @returns Nuevo access token y refresh token
     */
    async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ token: string; refreshToken: string; user: { sub: string; email: string } }> {
        const command = new InitiateAuthCommand({
            AuthFlow: 'REFRESH_TOKEN_AUTH',
            ClientId: COGNITO_CLIENT_ID,
            AuthParameters: {
                REFRESH_TOKEN: refreshTokenDto.refreshToken,
            },
        });
        const response = await cognitoClient.send(command);
        const idToken = response.AuthenticationResult?.IdToken;
        const refreshToken = response.AuthenticationResult?.RefreshToken || refreshTokenDto.refreshToken;
        
        if (!idToken) {
            throw new Error('Invalid refresh token');
        }
        
        // Decodificar sin verificar para extraer sub y email
        const decoded = jwt.decode(idToken) as { sub?: string; email?: string } | null;
        return {
            token: idToken,
            refreshToken,
            user: { sub: decoded?.sub ?? '', email: decoded?.email ?? '' },
        };
    }

    /**
     * Verifica un token JWT emitido por Cognito usando la JWKS pública.
     * Esta implementación descarga la JWKS en cada llamada (para simplicidad).
     */
    async verifyToken(token: string): Promise<{ sub: string; email: string }> {
        // Obtener el poolId (ej: us-east-1_XXXX) para construir la URL JWKS
        const poolId = COGNITO_USER_POOL_ID;
        if (!poolId) {
            throw new Error('Cognito User Pool ID not configured');
        }
        const region = COGNITO_REGION;
        const jwksUrl = `https://cognito-idp.${region}.amazonaws.com/${poolId}/.well-known/jwks.json`;
        const jwksRes = await fetch(jwksUrl);
        if (!jwksRes.ok) {
            throw new Error('Unable to fetch Cognito JWKS');
        }
        const jwks = (await jwksRes.json()) as JWKS;
        // Convertir JWKS a un objeto de claves para jsonwebtoken
        const getKey = (header: JWTHeader, callback: jwt.VerifyCallback) => {
            const key = jwks.keys.find((k) => k.kid === header.kid);
            if (!key) {
                return callback(new Error('Unable to find matching key'), undefined);
            }
            // Construir la clave pública en formato PEM
            const pubKey = jwkToPem(key);
            callback(null, pubKey);
        };
        return new Promise<{ sub: string; email: string }>((resolve, reject) => {
            jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
                if (err || !decoded) {
                    return reject(err || new Error('Invalid token'));
                }
                const payload = decoded as { sub?: string; email?: string };
                resolve({ sub: payload.sub ?? '', email: payload.email ?? '' });
            });
        });
    }
}

/**
 * Convierte un JWK (JSON Web Key) a formato PEM
 * @param jwk - JSON Web Key a convertir
 * @returns Clave pública en formato PEM
 */
function jwkToPem(jwk: JWK): string {
    if (jwk.kty !== 'RSA') {
        throw new Error('Unsupported key type');
    }
    const exponent = Buffer.from(jwk.e, 'base64');
    const modulus = Buffer.from(jwk.n, 'base64');
    // Construir la estructura ASN.1 para la clave pública RSA
    const getLength = (buf: Buffer) => {
        const len = buf.length;
        if (len < 0x80) return Buffer.from([len]);
        const lenHex = len.toString(16);
        const lenBytes = Buffer.from(lenHex, 'hex');
        return Buffer.concat([Buffer.from([0x80 + lenBytes.length]), lenBytes]);
    };
    const sequence = Buffer.concat([
        Buffer.from([0x30]), // SEQUENCE
        getLength(Buffer.concat([
            Buffer.from([0x30]), // SEQUENCE (algo identifier)
            getLength(Buffer.from([0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01])), // OID rsaEncryption
            Buffer.from([0x05, 0x00]), // NULL
        ])),
        Buffer.from([0x03]), // BIT STRING
        getLength(Buffer.concat([Buffer.from([0x00]), // unused bits
        Buffer.from([0x30]), // SEQUENCE
        getLength(Buffer.concat([
            Buffer.from([0x02]), // INTEGER (modulus)
            getLength(modulus),
            modulus,
            Buffer.from([0x02]), // INTEGER (exponent)
            getLength(exponent),
            exponent,
        ])),
        ])),
    ]);
    return `-----BEGIN PUBLIC KEY-----\n${sequence.toString('base64').match(/.{1,64}/g)!.join('\n')}\n-----END PUBLIC KEY-----`;
}
