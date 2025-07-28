import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { handler } from '../../../src/handlers/createCoffee';
import { DynamoService } from '../../../src/services/dynamoService';

// Mock the DynamoService
jest.mock('../../../src/services/dynamoService');

const mockDynamoService = jest.mocked(DynamoService);

// Mock UUID
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123'),
}));

describe('createCoffee handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockEvent = (body: any): APIGatewayProxyEvent => ({
    body: JSON.stringify(body),
    pathParameters: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/coffees',
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
  });

  it('should create coffee successfully', async () => {
    const requestBody = {
      name: 'Test Coffee',
      description: 'Test Description',
      price: 3.50,
      category: 'espresso',
      size: 'small',
    };

    const expectedCoffee = {
      id: 'test-uuid-123',
      ...requestBody,
      available: true,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    };

    mockDynamoService.prototype.createCoffee.mockResolvedValue(expectedCoffee as any);

    const event = createMockEvent(requestBody);
    const result = await handler(event, {} as any, {} as any) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(201);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(true);
    expect(responseBody.data).toMatchObject({
      id: 'test-uuid-123',
      name: 'Test Coffee',
      description: 'Test Description',
      price: 3.50,
      category: 'espresso',
      size: 'small',
      available: true,
    });
  });

  it('should return 400 for invalid input', async () => {
    const requestBody = {
      name: '', // Invalid empty name
      description: 'Test Description',
      price: 3.50,
    };

    const event = createMockEvent(requestBody);
    const result = await handler(event, {} as any, {} as any) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).success).toBe(false);
  });

  it('should return 400 when body is missing', async () => {
    const event = {
      ...createMockEvent({}),
      body: null,
    };

    const result = await handler(event, {} as any, {} as any) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      success: false,
      error: 'Request body is required',
    });
  });

  it('should return 500 when DynamoDB throws error', async () => {
    const requestBody = {
      name: 'Test Coffee',
      description: 'Test Description',
      price: 3.50,
      category: 'espresso',
      size: 'small',
    };

    mockDynamoService.prototype.createCoffee.mockRejectedValue(new Error('DynamoDB error'));

    const event = createMockEvent(requestBody);
    const result = await handler(event, {} as any, {} as any) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      success: false,
      error: 'Internal server error',
    });
  });
});