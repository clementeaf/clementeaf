import { APIGatewayProxyHandler } from 'aws-lambda';
import { ActivityService } from '../services/ActivityService';
import { ActivityType, ResourceType } from '../entities/UserActivity.entity';

export const handler: APIGatewayProxyHandler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Content-Type': 'application/json',
  };

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const body = JSON.parse(event.body);
    
    // Extraer userId del contexto de autenticación (authorizer)
    const userId = event.requestContext?.authorizer?.claims?.sub 
      ? parseInt(event.requestContext.authorizer.claims['custom:userId'] || '0')
      : body.userId;

    if (!userId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'User not authenticated' }),
      };
    }

    // Extraer información de la request
    const ipAddress = event.requestContext?.identity?.sourceIp || null;
    const userAgent = event.headers?.['User-Agent'] || event.headers?.['user-agent'] || null;

    const activityService = new ActivityService();
    const activity = await activityService.recordActivity({
      userId,
      activityType: body.activityType as ActivityType,
      resourceType: body.resourceType as ResourceType || null,
      resourceId: body.resourceId || null,
      description: body.description,
      path: body.path || null,
      method: event.httpMethod,
      targetElement: body.targetElement || null,
      targetId: body.targetId || null,
      targetText: body.targetText || null,
      metadata: body.metadata || null,
      ipAddress,
      userAgent,
      sessionId: body.sessionId || null,
      durationMs: body.durationMs || null,
    });

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        message: 'Activity recorded successfully',
        activity: {
          id: activity.id,
          activityType: activity.activityType,
          description: activity.description,
          createdAt: activity.createdAt,
        },
      }),
    };
  } catch (error: any) {
    console.error('Error recording activity:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to record activity', details: error.message }),
    };
  }
};
