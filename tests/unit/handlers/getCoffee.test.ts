import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../../../src/handlers/getCoffee';
import { DynamoService } from '../../../src/services/dynamoService';

jest.mock('../../../src/services/dynamoService');

const mockDynamoService = DynamoService as jest.MockedClass<typeof DynamoService>;

describe('getCoffee handler', () => {
  let mockEvent: Partial<APIGatewayProxyEvent>;
  let mockContext: Partial<Context>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockEvent = {
      pathParameters: { id: 'test-coffee-id' },
    };
    
    mockContext = {};
  });

  it('should get a coffee successfully', async () => {
    const coffee = {
      id: 'test-coffee-id',
      name: 'Espresso',
      description: 'Strong coffee',
      price: 3.50,
      category: 'espresso' as const,
      size: 'small' as const,
      available: true,
      createdAt: '2025-08-01T00:00:00.000Z',
      updatedAt: '2025-08-01T00:00:00.000Z',
    };

    mockDynamoService.prototype.getCoffee.mockResolvedValue(coffee);

    const result = await handler(
      mockEvent as APIGatewayProxyEvent,
      mockContext as Context,
      {} as any
    ) as any;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      success: true,
      data: coffee,
    });
    expect(mockDynamoService.prototype.getCoffee).toHaveBeenCalledWith('test-coffee-id');
  });

  it('should return 404 when coffee is not found', async () => {
    mockDynamoService.prototype.getCoffee.mockResolvedValue(null);

    const result = await handler(
      mockEvent as APIGatewayProxyEvent,
      mockContext as Context,
      {} as any
    ) as any;

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toEqual({
      success: false,
      error: 'Coffee not found',
    });
  });

  it('should return 400 when coffee ID is missing', async () => {
    mockEvent.pathParameters = {};

    const result = await handler(
      mockEvent as APIGatewayProxyEvent,
      mockContext as Context,
      {} as any
    ) as any;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      success: false,
      error: 'Coffee ID is required',
    });
  });

  it('should return 400 when pathParameters is null', async () => {
    mockEvent.pathParameters = null;

    const result = await handler(
      mockEvent as APIGatewayProxyEvent,
      mockContext as Context,
      {} as any
    ) as any;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      success: false,
      error: 'Coffee ID is required',
    });
  });

  it('should handle internal server error', async () => {
    mockDynamoService.prototype.getCoffee.mockRejectedValue(
      new Error('DynamoDB error')
    );

    const result = await handler(
      mockEvent as APIGatewayProxyEvent,
      mockContext as Context,
      {} as any
    ) as any;

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      success: false,
      error: 'Internal server error',
    });
  });
});