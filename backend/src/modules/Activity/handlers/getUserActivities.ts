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
    const userId = event.pathParameters?.userId;

    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userId is required' }),
      };
    }

    const queryParams = event.queryStringParameters || {};
    const limit = Math.min(parseInt(queryParams.limit || '100'), 200);

    const activityService = new ActivityService();
    const activities = await activityService.getUserActivities(parseInt(userId), limit);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        userId: parseInt(userId),
        activities,
        total: activities.length,
      }),
    };
  } catch (error: any) {
    console.error('Error getting user activities:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to get user activities', details: error.message }),
    };
  }
};
