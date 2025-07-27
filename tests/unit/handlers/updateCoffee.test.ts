import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../../../src/handlers/updateCoffee';
import { DynamoService } from '../../../src/services/dynamoService';

jest.mock('../../../src/services/dynamoService');

const mockDynamoService = DynamoService as jest.MockedClass<typeof DynamoService>;

describe('updateCoffee handler', () => {
  let mockEvent: Partial<APIGatewayProxyEvent>;
  let mockContext: Partial<Context>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockEvent = {
      pathParameters: { id: 'test-coffee-id' },
      body: JSON.stringify({
        name: 'Updated Espresso',
        price: 4.00,
        available: false
      }),
    };
    
    mockContext = {};
  });

  it('should update a coffee successfully', async () => {
    const updatedCoffee = {
      id: 'test-coffee-id',
      name: 'Updated Espresso',
      description: 'Strong coffee',
      price: 4.00,
      category: 'espresso' as const,
      size: 'small' as const,
      available: false,
      createdAt: '2025-08-01T00:00:00.000Z',
      updatedAt: '2025-08-01T00:00:00.000Z',
    };

    mockDynamoService.prototype.updateCoffee.mockResolvedValue(updatedCoffee);

    const result = await handler(
      mockEvent as APIGatewayProxyEvent,
      mockContext as Context,
      {} as any
    ) as any;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      success: true,
      data: updatedCoffee,
    });
    expect(mockDynamoService.prototype.updateCoffee).toHaveBeenCalledWith(
      'test-coffee-id',
      {
        name: 'Updated Espresso',
        price: 4.00,
        available: false,
      }
    );
  });

  it('should return 404 when coffee is not found', async () => {
    mockDynamoService.prototype.updateCoffee.mockResolvedValue(null);

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

  it('should return 400 when request body is missing', async () => {
    mockEvent.body = null;

    const result = await handler(
      mockEvent as APIGatewayProxyEvent,
      mockContext as Context,
      {} as any
    ) as any;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      success: false,
      error: 'Request body is required',
    });
  });

  it('should return 400 for invalid price', async () => {
    mockEvent.body = JSON.stringify({
      price: -5.00, // Invalid negative price
    });

    const result = await handler(
      mockEvent as APIGatewayProxyEvent,
      mockContext as Context,
      {} as any
    ) as any;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      success: false,
      error: 'Price must be a positive number',
    });
  });

  it('should return 400 for invalid category', async () => {
    mockEvent.body = JSON.stringify({
      category: 'invalid-category',
    });

    const result = await handler(
      mockEvent as APIGatewayProxyEvent,
      mockContext as Context,
      {} as any
    ) as any;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toContain('Category must be one of');
  });

  it('should handle partial updates correctly', async () => {
    mockEvent.body = JSON.stringify({
      price: 3.75, // Only updating price
    });

    const updatedCoffee = {
      id: 'test-coffee-id',
      name: 'Original Espresso',
      description: 'Strong coffee',
      price: 3.75,
      category: 'espresso' as const,
      size: 'small' as const,
      available: true,
      createdAt: '2025-08-01T00:00:00.000Z',
      updatedAt: '2025-08-02T00:00:00.000Z',
    };

    mockDynamoService.prototype.updateCoffee.mockResolvedValue(updatedCoffee);

    const result = await handler(
      mockEvent as APIGatewayProxyEvent,
      mockContext as Context,
      {} as any
    ) as any;

    expect(result.statusCode).toBe(200);
    expect(mockDynamoService.prototype.updateCoffee).toHaveBeenCalledWith(
      'test-coffee-id',
      { price: 3.75 }
    );
  });

  it('should handle internal server error', async () => {
    mockDynamoService.prototype.updateCoffee.mockRejectedValue(
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