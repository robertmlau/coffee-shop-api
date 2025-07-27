import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoService } from '../services/dynamoService';
import { successResponse, errorResponse } from '../utils/response';

const dynamoService = new DynamoService();

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters || {};

    if (!id) {
      return errorResponse('Coffee ID is required', 400);
    }

    const coffee = await dynamoService.getCoffee(id);

    if (!coffee) {
      return errorResponse('Coffee not found', 404);
    }

    return successResponse(coffee);
  } catch (error) {
    console.error('Error getting coffee:', error);
    return errorResponse('Internal server error', 500);
  }
};