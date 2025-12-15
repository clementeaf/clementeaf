/**
 * DTO para intercambiar un authorization code por tokens en Cognito Hosted UI
 */
export interface OAuthCallbackDto {
  code: string;
  redirectUri: string;
  codeVerifier: string;
}

