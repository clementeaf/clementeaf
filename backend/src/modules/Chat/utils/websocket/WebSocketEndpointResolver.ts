/**
 * Resuelve el endpoint de WebSocket Management API desde el contexto del evento
 * @param requestContext - Request context del evento de API Gateway
 * @returns Endpoint de WebSocket Management API
 */
export const resolveWebSocketEndpoint = (requestContext?: {
  domainName?: string;
  stage?: string;
}): string => {
  // Si se proporciona requestContext, construir el endpoint dinámicamente
  if (requestContext?.domainName && requestContext?.stage) {
    return `https://${requestContext.domainName}/${requestContext.stage}`;
  }

  // Fallback a variables de entorno
  if (process.env.WEBSOCKET_API_ENDPOINT) {
    return process.env.WEBSOCKET_API_ENDPOINT;
  }

  const wssEndpoint = process.env.WSS_ENDPOINT;
  if (wssEndpoint) {
    return wssEndpoint.replace('wss://', 'https://');
  }

  // Fallback hardcodeado (solo para desarrollo)
  // En producción, esto debería estar en variables de entorno
  // Intentar obtener desde el contexto de API Gateway si está disponible
  const apiId = process.env.API_GATEWAY_REST_API_ID;
  const stage = process.env.STAGE || 'dev';
  const region = process.env.AWS_REGION || 'us-east-1';
  
  if (apiId) {
    return `https://${apiId}.execute-api.${region}.amazonaws.com/${stage}`;
  }
  
  // Último fallback (solo para desarrollo)
  return 'https://us3x8rdme1.execute-api.us-east-1.amazonaws.com/dev';
};

