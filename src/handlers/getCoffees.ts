import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoService } from '../services/dynamoService';
import { successResponse, errorResponse } from '../utils/response';

const dynamoService = new DynamoService();

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const coffees = await dynamoService.getAllCoffees();
    return successResponse(coffees);
  } catch (error) {
    console.error('Error getting coffees:', error);
    return errorResponse('Internal server error', 500);
  }
};