import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../../../src/handlers/deleteCoffee';
import { DynamoService } from '../../../src/services/dynamoService';

jest.mock('../../../src/services/dynamoService');

const mockDynamoService = DynamoService as jest.MockedClass<typeof DynamoService>;

describe('deleteCoffee handler', () => {
  let mockEvent: Partial<APIGatewayProxyEvent>;
  let mockContext: Partial<Context>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockEvent = {
      pathParameters: { id: '550e8400-e29b-41d4-a716-446655440000' },
    };
    
    mockContext = {};
  });

  it('should delete a coffee successfully', async () => {
    const existingCoffee = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Espresso',
      description: 'Strong coffee',
      price: 3.50,
      category: 'espresso' as const,
      size: 'small' as const,
      available: true,
      createdAt: '2025-08-01T00:00:00.000Z',
      updatedAt: '2025-08-01T00:00:00.000Z',
    };

    mockDynamoService.prototype.getCoffee.mockResolvedValue(existingCoffee);
    mockDynamoService.prototype.deleteCoffee.mockResolvedValue(true);

    const result = await handler(
      mockEvent as APIGatewayProxyEvent,
      mockContext as Context,
      {} as any
    ) as any;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      success: true,
      data: { message: 'Coffee deleted successfully' },
    });
    expect(mockDynamoService.prototype.getCoffee).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
    expect(mockDynamoService.prototype.deleteCoffee).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
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
    expect(mockDynamoService.prototype.deleteCoffee).not.toHaveBeenCalled();
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

  it('should handle error when checking if coffee exists', async () => {
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

  it('should handle error when deleting coffee', async () => {
    const existingCoffee = {
      id: '550e8400-e29b-41d4-a716-446655440000', 
      name: 'Espresso',
      description: 'Strong coffee',
      price: 3.50,
      category: 'espresso' as const,
      size: 'small' as const,
      available: true,
      createdAt: '2025-08-01T00:00:00.000Z',
      updatedAt: '2025-08-01T00:00:00.000Z',
    };

    mockDynamoService.prototype.getCoffee.mockResolvedValue(existingCoffee);
    mockDynamoService.prototype.deleteCoffee.mockRejectedValue(
      new Error('DynamoDB delete error')
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