import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../../../src/handlers/getCoffees';
import { DynamoService } from '../../../src/services/dynamoService';

jest.mock('../../../src/services/dynamoService');

const mockDynamoService = DynamoService as jest.MockedClass<typeof DynamoService>;

describe('getCoffees handler', () => {
  let mockEvent: Partial<APIGatewayProxyEvent>;
  let mockContext: Partial<Context>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockEvent = {};
    mockContext = {};
  });

  it('should get all coffees successfully', async () => {
    const coffees = [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Espresso',
        description: 'Strong coffee',
        price: 3.50,
        category: 'espresso' as const,
        size: 'small' as const,
        available: true,
        createdAt: '2025-08-01T00:00:00.000Z',
        updatedAt: '2025-08-01T00:00:00.000Z',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Latte',
        description: 'Espresso with steamed milk',
        price: 4.50,
        category: 'latte' as const,
        size: 'medium' as const,
        available: true,
        createdAt: '2025-08-01T00:00:00.000Z',
        updatedAt: '2025-08-01T00:00:00.000Z',
      },
    ];

    mockDynamoService.prototype.getAllCoffees.mockResolvedValue(coffees);

    const result = await handler(
      mockEvent as APIGatewayProxyEvent,
      mockContext as Context,
      {} as any
    ) as any;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      success: true,
      data: coffees,
    });
    expect(mockDynamoService.prototype.getAllCoffees).toHaveBeenCalled();
  });

  it('should return empty array when no coffees exist', async () => {
    mockDynamoService.prototype.getAllCoffees.mockResolvedValue([]);

    const result = await handler(
      mockEvent as APIGatewayProxyEvent,
      mockContext as Context,
      {} as any
    ) as any;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      success: true,
      data: [],
    });
  });

  it('should handle internal server error', async () => {
    mockDynamoService.prototype.getAllCoffees.mockRejectedValue(
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