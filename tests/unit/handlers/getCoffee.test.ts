import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { handler } from '../../../src/handlers/getCoffee';
import { DynamoService } from '../../../src/services/dynamoService';

// Mock the DynamoService
jest.mock('../../../src/services/dynamoService');

const mockDynamoService = jest.mocked(DynamoService);

describe('getCoffee handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockEvent = (pathParameters: any = null): APIGatewayProxyEvent => ({
    pathParameters,
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    path: '/coffees/123',
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
  });

  it('should return coffee when found', async () => {
    const mockCoffee = {
      id: 'test-id',
      name: 'Test Coffee',
      description: 'Test Description',
      price: 3.50,
      category: 'espresso' as const,
      size: 'small' as const,
      available: true,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    };

    mockDynamoService.prototype.getCoffee.mockResolvedValue(mockCoffee);

    const event = createMockEvent({ id: 'test-id' });
    const result = await handler(event, {} as any, {} as any) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      success: true,
      data: mockCoffee,
    });
    expect(mockDynamoService.prototype.getCoffee).toHaveBeenCalledWith('test-id');
  });

  it('should return 404 when coffee not found', async () => {
    mockDynamoService.prototype.getCoffee.mockResolvedValue(null);

    const event = createMockEvent({ id: 'non-existent-id' });
    const result = await handler(event, {} as any, {} as any) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toEqual({
      success: false,
      error: 'Coffee not found',
    });
  });

  it('should return 400 when id is missing', async () => {
    const event = createMockEvent(null);
    const result = await handler(event, {} as any, {} as any) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      success: false,
      error: 'Coffee ID is required',
    });
  });

  it('should return 500 when DynamoDB throws error', async () => {
    mockDynamoService.prototype.getCoffee.mockRejectedValue(new Error('DynamoDB error'));

    const event = createMockEvent({ id: 'test-id' });
    const result = await handler(event, {} as any, {} as any) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      success: false,
      error: 'Internal server error',
    });
  });
});