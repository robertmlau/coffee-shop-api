import { handler as getCoffeeHandler } from '../../src/handlers/getCoffee';
import { handler as updateCoffeeHandler } from '../../src/handlers/updateCoffee';
import { handler as deleteCoffeeHandler } from '../../src/handlers/deleteCoffee';
import { setupTestData, cleanupTestData } from '../setup';

describe('Coffee API Integration Tests', () => {
  beforeAll(async () => {
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /coffees/{id}', () => {
    it('should retrieve existing coffee', async () => {
      const event = {
        pathParameters: { id: 'integration-test-coffee' },
      } as any;

      const result = await getCoffeeHandler(event, {} as any, {} as any) as any;
      const body = JSON.parse(result.body);

      expect(result.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe('integration-test-coffee');
      expect(body.data.name).toBe('Test Espresso');
    });
  });

  describe('PUT /coffees/{id}', () => {
    it('should update existing coffee', async () => {
      const event = {
        pathParameters: { id: 'integration-test-coffee' },
        body: JSON.stringify({
          name: 'Updated Test Espresso',
          price: 4.00,
        }),
      } as any;

      const result = await updateCoffeeHandler(event, {} as any, {} as any) as any;
      const body = JSON.parse(result.body);

      expect(result.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('Updated Test Espresso');
      expect(body.data.price).toBe(4.00);
    });
  });

  describe('DELETE /coffees/{id}', () => {
    it('should delete existing coffee', async () => {
      const event = {
        pathParameters: { id: 'integration-test-coffee' },
      } as any;

      const result = await deleteCoffeeHandler(event, {} as any, {} as any) as any;
      const body = JSON.parse(result.body);

      expect(result.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.message).toBe('Coffee deleted successfully');

      // Verify coffee is actually deleted
      const getResult = await getCoffeeHandler(
        { pathParameters: { id: 'integration-test-coffee' } } as any,
        {} as any,
        {} as any
      ) as any;
      expect(getResult.statusCode).toBe(404);
    });
  });
});