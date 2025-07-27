// src/handlers/createCoffee.ts
import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { DynamoService } from '../services/dynamoService';
import { successResponse, errorResponse } from '../utils/response';
import { validateCreateCoffee } from '../utils/validation';
import { Coffee } from '../models/Coffee';

const dynamoService = new DynamoService();

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return errorResponse('Request body is required', 400);
    }

    const requestData = JSON.parse(event.body);
    const validation = validateCreateCoffee(requestData);

    if (typeof validation === 'string') {
      return errorResponse(validation, 400);
    }

    const newCoffee: Coffee = {
      id: uuidv4(),
      ...validation,
      available: validation.available ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const coffee = await dynamoService.createCoffee(newCoffee);
    return successResponse(coffee, 201);
  } catch (error) {
    console.error('Error creating coffee:', error);
    return errorResponse('Internal server error', 500);
  }
};