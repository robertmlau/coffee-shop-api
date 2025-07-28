// tests/integration/api.integration.test.ts
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDB } from 'aws-sdk';
import { Coffee, CreateCoffeeRequest } from '../../src/models/Coffee';

// API Client for making HTTP requests
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.API_GATEWAY_URL || 'http://localhost:3000/dev';
  }

  async get<T>(path: string): Promise<{ status: number; body: any }> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const body = await response.json();
    return { status: response.status, body };
  }

  async post<T>(path: string, data: any): Promise<{ status: number; body: any }> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const body = await response.json();
    return { status: response.status, body };
  }

  async put<T>(path: string, data: any): Promise<{ status: number; body: any }> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const body = await response.json();
    return { status: response.status, body };
  }

  async delete<T>(path: string): Promise<{ status: number; body: any }> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    const body = await response.json();
    return { status: response.status, body };
  }
}

// Test Setup Helper
class TestSetup {
  private dynamoDb: DynamoDB.DocumentClient;
  private tableName: string;

  constructor() {
    this.dynamoDb = new DynamoDB.DocumentClient({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
    });
    this.tableName = process.env.COFFEE_TABLE || 'coffee-shop-api-test-coffees';
  }

  async createTestTable(): Promise<void> {
    const dynamodb = new DynamoDB({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
    });

    const params = {
      TableName: this.tableName,
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      BillingMode: 'PAY_PER_REQUEST',
    };

    try {
      await dynamodb.createTable(params).promise();
      await dynamodb.waitFor('tableExists', { TableName: this.tableName }).promise();
      console.log(`✅ Test table ${this.tableName} created`);
    } catch (error: any) {
      if (error.code !== 'ResourceInUseException') {
        throw error;
      }
      console.log(`ℹ️ Test table ${this.tableName} already exists`);
    }
  }

  async cleanupTestData(): Promise<void> {
    try {
      const result = await this.dynamoDb.scan({ TableName: this.tableName }).promise();
      if (result.Items && result.Items.length > 0) {
        const deletePromises = result.Items.map((item) =>
          this.dynamoDb.delete({
            TableName: this.tableName,
            Key: { id: item.id },
          }).promise()
        );
        await Promise.all(deletePromises);
        console.log(`🧹 Cleaned up ${result.Items.length} test records`);
      }
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
  }

  async insertTestCoffee(coffee: Coffee): Promise<Coffee> {
    await this.dynamoDb.put({
      TableName: this.tableName,
      Item: coffee,
    }).promise();
    return coffee;
  }

  async getCoffeeById(id: string): Promise<Coffee | null> {
    const result = await this.dynamoDb.get({
      TableName: this.tableName,
      Key: { id },
    }).promise();
    return result.Item as Coffee || null;
  }
}

// Test Data Factory
const createTestCoffee = (overrides: Partial<Coffee> = {}): Coffee => ({
  id: uuidv4(),
  name: 'Test Cappuccino',
  description: 'A test cappuccino for integration testing',
  price: 4.50,
  category: 'cappuccino',
  size: 'medium',
  available: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const createTestCoffeeRequest = (overrides: Partial<CreateCoffeeRequest> = {}): CreateCoffeeRequest => ({
  name: 'Test Latte',
  description: 'A test latte for integration testing',
  price: 5.00,
  category: 'latte',
  size: 'large',
  available: true,
  ...overrides,
});

// Main Integration Tests
describe('Coffee Shop API Integration Tests', () => {
  let apiClient: ApiClient;
  let testSetup: TestSetup;

  beforeAll(async () => {
    // Initialize test environment
    testSetup = new TestSetup();
    apiClient = new ApiClient();
    
    // Set environment variables
    process.env.COFFEE_TABLE = process.env.COFFEE_TABLE || 'coffee-shop-api-test-coffees';
    
    // Create test table
    await testSetup.createTestTable();
  }, 60000); // 60 second timeout for table creation

  beforeEach(async () => {
    // Clean up before each test
    await testSetup.cleanupTestData();
  });

  afterAll(async () => {
    // Final cleanup
    await testSetup.cleanupTestData();
  }, 30000);

  describe('POST /coffees - Create Coffee', () => {
    it('should create a new coffee successfully', async () => {
      const coffeeRequest = createTestCoffeeRequest({
        name: 'Integration Test Espresso',
        description: 'Strong espresso for testing',
        price: 3.00,
        category: 'espresso',
        size: 'small',
      });

      const response = await apiClient.post<Coffee>('/coffees', coffeeRequest);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        ...coffeeRequest,
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      // Verify the coffee was actually saved to DynamoDB
      const savedCoffee = await testSetup.getCoffeeById(response.body.data.id);
      expect(savedCoffee).toMatchObject(coffeeRequest);
    });

    it('should return 400 for invalid coffee data', async () => {
      const invalidRequest = {
        name: '', // Invalid empty name
        description: 'Test description',
        price: -5, // Invalid negative price
        category: 'invalid-category', // Invalid category
      };

      const response = await apiClient.post('/coffees', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when request body is missing', async () => {
      const response = await fetch(`${apiClient['baseUrl']}/coffees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // No body
      });

      const body = await response.json() as any;
      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Request body is required');
    });
  });

  describe('GET /coffees - Get All Coffees', () => {
    it('should return all coffees', async () => {
      // Insert test data
      const testCoffees = [
        createTestCoffee({ name: 'Espresso', category: 'espresso', size: 'small' }),
        createTestCoffee({ name: 'Latte', category: 'latte', size: 'large' }),
        createTestCoffee({ name: 'Americano', category: 'americano', size: 'medium' }),
      ];

      await Promise.all(
        testCoffees.map(coffee => testSetup.insertTestCoffee(coffee))
      );

      const response = await apiClient.get<Coffee[]>('/coffees');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data).toEqual(expect.arrayContaining(testCoffees));
    });

    it('should return empty array when no coffees exist', async () => {
      const response = await apiClient.get<Coffee[]>('/coffees');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /coffees/{id} - Get Single Coffee', () => {
    it('should return a specific coffee', async () => {
      const testCoffee = createTestCoffee({
        name: 'Test Cappuccino',
        description: 'Creamy cappuccino',
        price: 4.25,
        category: 'cappuccino',
        size: 'medium',
      });

      await testSetup.insertTestCoffee(testCoffee);

      const response = await apiClient.get<Coffee>(`/coffees/${testCoffee.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(testCoffee);
    });

    it('should return 404 for non-existent coffee', async () => {
      const nonExistentId = uuidv4();
      const response = await apiClient.get(`/coffees/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Coffee not found');
    });

    it('should return 400 when ID is missing', async () => {
      // This would be handled by the API Gateway routing, but we can test the handler logic
      const response = await apiClient.get('/coffees/');

      // Depending on your API Gateway setup, this might return 404 or be routed differently
      expect([400, 404]).toContain(response.status);
    });
  });

  describe('PUT /coffees/{id} - Update Coffee', () => {
    it('should update an existing coffee', async () => {
      const testCoffee = createTestCoffee({
        name: 'Original Americano',
        price: 3.50,
        available: true,
      });

      await testSetup.insertTestCoffee(testCoffee);

      const updates = {
        name: 'Updated Premium Americano',
        price: 4.50,
        available: false,
        description: 'Premium coffee blend',
      };

      const response = await apiClient.put<Coffee>(`/coffees/${testCoffee.id}`, updates);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        ...testCoffee,
        ...updates,
        updatedAt: expect.any(String),
      });
      expect(response.body.data.updatedAt).not.toBe(testCoffee.updatedAt);

      // Verify the update was persisted
      const updatedCoffee = await testSetup.getCoffeeById(testCoffee.id);
      expect(updatedCoffee).toMatchObject(updates);
    });

    it('should return 404 for non-existent coffee', async () => {
      const nonExistentId = uuidv4();
      const updates = { name: 'Updated Name' };

      const response = await apiClient.put(`/coffees/${nonExistentId}`, updates);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Coffee not found');
    });

    it('should return 400 for invalid update data', async () => {
      const testCoffee = createTestCoffee();
      await testSetup.insertTestCoffee(testCoffee);

      const invalidUpdates = {
        price: -10, // Invalid negative price
        category: 'invalid-category', // Invalid category
      };

      const response = await apiClient.put(`/coffees/${testCoffee.id}`, invalidUpdates);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should allow partial updates', async () => {
      const testCoffee = createTestCoffee({
        name: 'Original Name',
        price: 5.00,
        available: true,
      });

      await testSetup.insertTestCoffee(testCoffee);

      // Only update the price
      const partialUpdate = { price: 6.00 };

      const response = await apiClient.put<Coffee>(`/coffees/${testCoffee.id}`, partialUpdate);

      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject({
        ...testCoffee,
        price: 6.00,
        updatedAt: expect.any(String),
      });
      expect(response.body.data.name).toBe(testCoffee.name); // Should remain unchanged
    });
  });

  describe('DELETE /coffees/{id} - Delete Coffee', () => {
    it('should delete an existing coffee', async () => {
      const testCoffee = createTestCoffee({
        name: 'Coffee to Delete',
        category: 'specialty',
      });

      await testSetup.insertTestCoffee(testCoffee);

      const response = await apiClient.delete(`/coffees/${testCoffee.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        message: 'Coffee deleted successfully',
      });

      // Verify the coffee was actually deleted
      const deletedCoffee = await testSetup.getCoffeeById(testCoffee.id);
      expect(deletedCoffee).toBeNull();
    });

    it('should return 404 for non-existent coffee', async () => {
      const nonExistentId = uuidv4();
      const response = await apiClient.delete(`/coffees/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Coffee not found');
    });
  });

  describe('End-to-End Coffee Lifecycle Testing', () => {
    it('should handle complete CRUD lifecycle', async () => {
      // 1. CREATE - Add a new coffee
      const coffeeRequest = createTestCoffeeRequest({
        name: 'E2E Test Mocha',
        description: 'Rich chocolate coffee for end-to-end testing',
        price: 5.75,
        category: 'specialty',
        size: 'large',
        available: true,
      });

      const createResponse = await apiClient.post<Coffee>('/coffees', coffeeRequest);
      expect(createResponse.status).toBe(201);
      const createdCoffee = createResponse.body.data;

      // 2. READ - Fetch the created coffee
      const readResponse = await apiClient.get<Coffee>(`/coffees/${createdCoffee.id}`);
      expect(readResponse.status).toBe(200);
      expect(readResponse.body.data).toEqual(createdCoffee);

      // 3. READ ALL - Verify it appears in the list
      const listResponse = await apiClient.get<Coffee[]>('/coffees');
      expect(listResponse.status).toBe(200);
      expect(listResponse.body.data).toContainEqual(createdCoffee);

      // 4. UPDATE - Modify the coffee
      const updates = {
        name: 'Updated E2E Mocha Deluxe',
        price: 6.25,
        available: false,
      };

      const updateResponse = await apiClient.put<Coffee>(`/coffees/${createdCoffee.id}`, updates);
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data).toMatchObject({
        ...createdCoffee,
        ...updates,
      });

      // 5. READ UPDATED - Verify the changes
      const readUpdatedResponse = await apiClient.get<Coffee>(`/coffees/${createdCoffee.id}`);
      expect(readUpdatedResponse.status).toBe(200);
      expect(readUpdatedResponse.body.data).toMatchObject(updates);

      // 6. DELETE - Remove the coffee
      const deleteResponse = await apiClient.delete(`/coffees/${createdCoffee.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.data.message).toBe('Coffee deleted successfully');

      // 7. VERIFY DELETION - Confirm it's gone
      const verifyDeleteResponse = await apiClient.get(`/coffees/${createdCoffee.id}`);
      expect(verifyDeleteResponse.status).toBe(404);
      expect(verifyDeleteResponse.body.error).toBe('Coffee not found');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed JSON in requests', async () => {
      const response = await fetch(`${apiClient['baseUrl']}/coffees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ invalid json }',
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should handle concurrent operations', async () => {
      const testCoffee = createTestCoffee();
      await testSetup.insertTestCoffee(testCoffee);

      // Attempt concurrent updates
      const update1 = apiClient.put(`/coffees/${testCoffee.id}`, { name: 'Update 1' });
      const update2 = apiClient.put(`/coffees/${testCoffee.id}`, { name: 'Update 2' });

      const [result1, result2] = await Promise.all([update1, update2]);

      // Both should succeed (last one wins in DynamoDB)
      expect(result1.status).toBe(200);
      expect(result2.status).toBe(200);
    });

    it('should handle various coffee categories and sizes', async () => {
      const categories: Array<Coffee['category']> = ['espresso', 'latte', 'cappuccino', 'americano', 'specialty'];
      const sizes: Array<Coffee['size']> = ['small', 'medium', 'large'];

      const promises = categories.flatMap(category =>
        sizes.map(size =>
          apiClient.post('/coffees', createTestCoffeeRequest({
            name: `${category} ${size}`,
            category,
            size,
          }))
        )
      );

      const results = await Promise.all(promises);
      results.forEach(result => {
        expect(result.status).toBe(201);
        expect(result.body.success).toBe(true);
      });

      // Verify they were all created
      const listResponse = await apiClient.get<Coffee[]>('/coffees');
      expect(listResponse.body.data).toHaveLength(15); // 5 categories × 3 sizes
    });
  });
});