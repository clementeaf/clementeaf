import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import fetch from 'node-fetch';
import * as jwt from 'jsonwebtoken';
import { COGNITO_CLIENT_ID, COGNITO_DOMAIN } from '../../../config/cognito';
import { validateBody, parseBody } from '../utils/validation';
import { successResponse, errorResponse } from '../utils/response';
import type { OAuthCallbackDto } from '../dto/OAuthCallbackDto';

interface CognitoTokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
}

/**
 * Intercambia un authorization code (OAuth) por tokens de Cognito.
 * @param dto - Datos del callback OAuth
 * @returns Respuesta de tokens desde Cognito
 */
const exchangeCodeForTokens = async (dto: OAuthCallbackDto): Promise<CognitoTokenResponse> => {
  if (!COGNITO_DOMAIN) {
    throw new Error('COGNITO_DOMAIN is not configured');
  }
  if (!COGNITO_CLIENT_ID) {
    throw new Error('COGNITO_CLIENT_ID is not configured');
  }

  const tokenUrl = `https://${COGNITO_DOMAIN}/oauth2/token`;
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: COGNITO_CLIENT_ID,
    code: dto.code,
    redirect_uri: dto.redirectUri,
    code_verifier: dto.codeVerifier
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Cognito token exchange failed: ${response.status} ${text}`);
  }

  const parsed = JSON.parse(text) as unknown;
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Cognito token response is invalid');
  }

  const tokenResp = parsed as CognitoTokenResponse;
  if (!tokenResp.id_token || !tokenResp.access_token) {
    throw new Error('Cognito token response is missing tokens');
  }

  return tokenResp;
};

/**
 * Handler para completar login con Google vía Cognito Hosted UI.
 * @param event - Evento de API Gateway
 * @returns Token (id_token) + refreshToken para reutilizar el flujo existente
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const bodyError = validateBody(event);
  if (bodyError) {
    return bodyError;
  }

  const dto = parseBody<OAuthCallbackDto>(event.body!);
  if (!dto) {
    return errorResponse(400, 'Invalid JSON format');
  }

  if (!dto.code || !dto.redirectUri || !dto.codeVerifier) {
    return errorResponse(400, 'code, redirectUri y codeVerifier son requeridos');
  }

  try {
    const tokens = await exchangeCodeForTokens(dto);
    const decoded = jwt.decode(tokens.id_token) as { sub?: string; email?: string; name?: string } | null;

    return successResponse(
      200,
      {
        token: tokens.id_token,
        refreshToken: tokens.refresh_token ?? '',
        user: {
          id: 0,
          email: decoded?.email ?? '',
          name: decoded?.name ?? null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      },
      'OAuth login completed successfully'
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'OAuth login failed';
    return errorResponse(401, errorMessage);
  }
};

