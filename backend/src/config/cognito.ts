// src/config/cognito.ts

/**
 * Configuración para AWS Cognito User Pool.
 * Las variables se leen del entorno y se exportan para uso interno.
 */
export const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || '';
export const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID || '';
export const COGNITO_REGION = process.env.COGNITO_REGION || process.env.AWS_REGION || 'us-east-1';
export const COGNITO_AUTO_CONFIRM = process.env.COGNITO_AUTO_CONFIRM === 'true';
export const COGNITO_DOMAIN = process.env.COGNITO_DOMAIN || '';

if (!COGNITO_USER_POOL_ID) {
  console.warn('COGNITO_USER_POOL_ID is not set');
}
if (!COGNITO_CLIENT_ID) {
  console.warn('COGNITO_CLIENT_ID is not set');
}
if (!COGNITO_REGION) {
  console.warn('COGNITO_REGION is not set');
}
if (!COGNITO_DOMAIN) {
  console.warn('COGNITO_DOMAIN is not set');
}
