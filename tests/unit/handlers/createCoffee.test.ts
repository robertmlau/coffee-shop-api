import { handler } from '../../../src/handlers/createCoffee';
import { DynamoService } from '../../../src/services/dynamoService';

jest.mock('../../../src/services/dynamoService');

const mockDynamoService = jest.mocked(DynamoService);

describe('createCoffee handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a coffee successfully', async () => {
    const mockCoffee = {
      id: 'test-id',
      name: 'Espresso',
      description: 'Strong coffee',
      price: 3.50,
      category: 'espresso' as const,
      size: 'small' as const,
      available: true,
      createdAt: '2025-08-01T00:00:00.000Z',
      updatedAt: '2025-08-01T00:00:00.000Z',
    };

    mockDynamoService.prototype.createCoffee.mockResolvedValue(mockCoffee);

    const event = {
      body: JSON.stringify({
        name: 'Espresso',
        description: 'Strong coffee',
        price: 3.50,
        category: 'espresso',
        size: 'small',
      }),
    } as any;

    const result = await handler(event, {} as any, {} as any) as any;

    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body).success).toBe(true);
  });

  it('should return 400 for invalid input', async () => {
    const event = {
      body: JSON.stringify({
        name: '', // Invalid empty name
        description: 'Strong coffee',
        price: 3.50,
      }),
    } as any;

    const result = await handler(event, {} as any, {} as any) as any;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).success).toBe(false);
  });
});