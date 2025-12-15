import { APIGatewayProxyHandler } from 'aws-lambda';
import { ActivityService } from '../services/ActivityService';

export const handler: APIGatewayProxyHandler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Content-Type': 'application/json',
  };

  try {
    const queryParams = event.queryStringParameters || {};
    
    // Filtros opcionales
    const filters: any = {};
    
    if (queryParams.startDate) {
      filters.startDate = new Date(queryParams.startDate);
    }
    
    if (queryParams.endDate) {
      filters.endDate = new Date(queryParams.endDate);
    }

    const activityService = new ActivityService();
    const stats = await activityService.getActivityStats(filters);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(stats),
    };
  } catch (error: any) {
    console.error('Error getting activity stats:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to get activity stats', details: error.message }),
    };
  }
};
