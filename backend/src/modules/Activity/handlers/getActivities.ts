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
    const queryParams = event.queryStringParameters || {};
    
    // Parsear filtros
    const filters: any = {};
    
    if (queryParams.userId) {
      filters.userId = parseInt(queryParams.userId);
    }
    
    if (queryParams.activityType) {
      filters.activityType = queryParams.activityType.includes(',')
        ? queryParams.activityType.split(',') as ActivityType[]
        : queryParams.activityType as ActivityType;
    }
    
    if (queryParams.resourceType) {
      filters.resourceType = queryParams.resourceType.includes(',')
        ? queryParams.resourceType.split(',') as ResourceType[]
        : queryParams.resourceType as ResourceType;
    }
    
    if (queryParams.resourceId) {
      filters.resourceId = queryParams.resourceId;
    }
    
    if (queryParams.startDate) {
      filters.startDate = new Date(queryParams.startDate);
    }
    
    if (queryParams.endDate) {
      filters.endDate = new Date(queryParams.endDate);
    }
    
    if (queryParams.path) {
      filters.path = queryParams.path;
    }
    
    if (queryParams.sessionId) {
      filters.sessionId = queryParams.sessionId;
    }

    // Paginación
    const page = parseInt(queryParams.page || '1');
    const limit = Math.min(parseInt(queryParams.limit || '50'), 100); // Max 100

    const activityService = new ActivityService();
    const { activities, total } = await activityService.getActivities(filters, page, limit);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        activities,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }),
    };
  } catch (error: any) {
    console.error('Error getting activities:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to get activities', details: error.message }),
    };
  }
};
