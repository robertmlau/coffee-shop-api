import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoService } from '../services/dynamoService';
import { successResponse, errorResponse } from '../utils/response';
import { validateUpdateCoffee } from '../utils/validation';

const dynamoService = new DynamoService();

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters || {};

    if (!id) {
      return errorResponse('Coffee ID is required', 400);
    }

    if (!event.body) {
      return errorResponse('Request body is required', 400);
    }

    const requestData = JSON.parse(event.body);
    const validation = validateUpdateCoffee(requestData);

    if (typeof validation === 'string') {
      return errorResponse(validation, 400);
    }

    const updatedCoffee = await dynamoService.updateCoffee(id, validation);

    if (!updatedCoffee) {
      return errorResponse('Coffee not found', 404);
    }

    return successResponse(updatedCoffee);
  } catch (error) {
    console.error('Error updating coffee:', error);
    return errorResponse('Internal server error', 500);
  }
};