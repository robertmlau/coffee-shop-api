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

    // Check if coffee exists before deleting
    const existingCoffee = await dynamoService.getCoffee(id);
    if (!existingCoffee) {
      return errorResponse('Coffee not found', 404);
    }

    await dynamoService.deleteCoffee(id);
    return successResponse({ message: 'Coffee deleted successfully' });
  } catch (error) {
    console.error('Error deleting coffee:', error);
    return errorResponse('Internal server error', 500);
  }
};