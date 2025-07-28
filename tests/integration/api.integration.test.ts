import { ApiClient } from './helpers/apiClient';
import { IntegrationTestSetup } from './helpers/testSetup';
import { createTestCoffee, createTestCoffeeRequest, testCoffees } from './helpers/testData';
import { Coffee } from '../../src/models/Coffee';

describe('API Integration Tests', () => {
  let apiClient: ApiClient;
  let testSetup: IntegrationTestSetup;

  beforeAll(async () => {
    testSetup = new IntegrationTestSetup();
    apiClient = new ApiClient();
    
    // Set environment variables
    process.env.COFFEE_TABLE = testSetup.getTableName();
    
    await testSetup.createTestTable();
  }, 30000);

  beforeEach(async () => {
    await testSetup.cleanupTestData();
  });

  afterAll(async () => {
    await testSetup.cleanupTestData();
  }, 30000);

  describe('POST /coffees', () => {
    it('should create a new coffee', async () => {
      const coffeeRequest = createTestCoffeeRequest();
      
      const response = await apiClient.post<Coffee>('/coffees', coffeeRequest);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        ...coffeeRequest,
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should return 400 for invalid coffee data', async () => {
      const invalidRequest = {
        name: '', // Invalid empty name
        description: 'Test',
        price: -1, // Invalid negative price
      };
      
      const response = await apiClient.post('/coffees', invalidRequest);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Name is required');
    });
  });

  describe('GET /coffees', () => {
    it('should return all coffees', async () => {
      // Insert test data
      const testCoffeeList = [testCoffees.espresso, testCoffees.latte];
      await Promise.all(
        testCoffeeList.map(coffee => testSetup.insertTestCoffee(coffee))
      );
      
      const response = await apiClient.get<Coffee[]>('/coffees');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data).toEqual(expect.arrayContaining(testCoffeeList));
    });

    it('should return empty array when no coffees exist', async () => {
      const response = await apiClient.get<Coffee[]>('/coffees');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /coffees/{id}', () => {
    it('should return a specific coffee', async () => {
      const testCoffee = testCoffees.espresso;
      await testSetup.insertTestCoffee(testCoffee);
      
      const response = await apiClient.get<Coffee>(`/coffees/${testCoffee.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(testCoffee);
    });

    it('should return 404 for non-existent coffee', async () => {
      const response = await apiClient.get('/coffees/non-existent-id');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Coffee not found');
    });
  });

  describe('PUT /coffees/{id}', () => {
    it('should update an existing coffee', async () => {
      const testCoffee = testCoffees.americano;
      await testSetup.insertTestCoffee(testCoffee);
      
      const updates = {
        name: 'Updated Americano',
        price: 4.00,
        available: false,
      };
      
      const response = await apiClient.put<Coffee>(`/coffees/${testCoffee.id}`, updates);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        ...testCoffee,
        ...updates,
        updatedAt: expect.any(String),
      });
      expect(response.body.data!.updatedAt).not.toBe(testCoffee.updatedAt);
    });

    it('should return 404 for non-existent coffee', async () => {
      const updates = { name: 'Updated Name' };
      
      const response = await apiClient.put('/coffees/non-existent-id', updates);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Coffee not found');
    });

    it('should return 400 for invalid update data', async () => {
      const testCoffee = testCoffees.espresso;
      await testSetup.insertTestCoffee(testCoffee);
      
      const invalidUpdates = {
        price: -5, // Invalid negative price
      };
      
      const response = await apiClient.put(`/coffees/${testCoffee.id}`, invalidUpdates);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('positive number');
    });
  });

  describe('DELETE /coffees/{id}', () => {
    it('should delete an existing coffee', async () => {
      const testCoffee = testCoffees.latte;
      await testSetup.insertTestCoffee(testCoffee);
      
      const response = await apiClient.delete(`/coffees/${testCoffee.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        message: 'Coffee deleted successfully',
      });
      
      // Verify it was deleted
      const deletedCoffee = await testSetup.getCoffeeById(testCoffee.id);
      expect(deletedCoffee).toBeNull();
    });

    it('should return 404 for non-existent coffee', async () => {
      const response = await apiClient.delete('/coffees/non-existent-id');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Coffee not found');
    });
  });

  describe('End-to-End Coffee Lifecycle', () => {
    it('should create, read, update, and delete a coffee', async () => {
      // 1. Create
      const coffeeRequest = createTestCoffeeRequest({
        name: 'E2E Test Coffee',
        description: 'End-to-end test coffee',
        price: 4.75,
        category: 'specialty',
        size: 'medium',
      });
      
      const createResponse = await apiClient.post<Coffee>('/coffees', coffeeRequest);
      expect(createResponse.status).toBe(201);
      const createdCoffee = createResponse.body.data!;
      
      // 2. Read
      const readResponse = await apiClient.get<Coffee>(`/coffees/${createdCoffee.id}`);
      expect(readResponse.status).toBe(200);
      expect(readResponse.body.data).toEqual(createdCoffee);
      
      // 3. Update
      const updates = { name: 'Updated E2E Coffee', price: 5.25 };
      const updateResponse = await apiClient.put<Coffee>(`/coffees/${createdCoffee.id}`, updates);
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data).toMatchObject({
        ...createdCoffee,
        ...updates,
      });
      
      // 4. Delete
      const deleteResponse = await apiClient.delete(`/coffees/${createdCoffee.id}`);
      expect(deleteResponse.status).toBe(200);
      expect((deleteResponse.body.data as any).message).toBe('Coffee deleted successfully');
      
      // 5. Verify deletion
      const verifyResponse = await apiClient.get(`/coffees/${createdCoffee.id}`);
      expect(verifyResponse.status).toBe(404);
    });
  });
});