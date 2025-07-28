import { DynamoService } from '../../src/services/dynamoService';
import { IntegrationTestSetup } from './helpers/testSetup';
import { createTestCoffee, createTestCoffeeRequest } from './helpers/testData';

describe('DynamoDB Integration Tests', () => {
  let testSetup: IntegrationTestSetup;
  let dynamoService: DynamoService;

  beforeAll(async () => {
    testSetup = new IntegrationTestSetup();
    
    // Set environment variables for tests
    process.env.COFFEE_TABLE = testSetup.getTableName();
    
    await testSetup.createTestTable();
    dynamoService = new DynamoService();
  }, 30000);

  beforeEach(async () => {
    await testSetup.cleanupTestData();
  });

  afterAll(async () => {
    await testSetup.cleanupTestData();
    // Comment out the next line if you want to keep the table for debugging
    // await testSetup.deleteTestTable();
  }, 30000);

  describe('createCoffee', () => {
    it('should create a coffee in DynamoDB', async () => {
      const testCoffee = createTestCoffee();
      
      const result = await dynamoService.createCoffee(testCoffee);
      
      expect(result).toEqual(testCoffee);
      
      // Verify it was actually saved
      const savedCoffee = await testSetup.getCoffeeById(testCoffee.id);
      expect(savedCoffee).toEqual(testCoffee);
    });
  });

  describe('getCoffee', () => {
    it('should retrieve a coffee from DynamoDB', async () => {
      const testCoffee = createTestCoffee();
      await testSetup.insertTestCoffee(testCoffee);
      
      const result = await dynamoService.getCoffee(testCoffee.id);
      
      expect(result).toEqual(testCoffee);
    });

    it('should return null for non-existent coffee', async () => {
      const result = await dynamoService.getCoffee('non-existent-id');
      
      expect(result).toBeNull();
    });
  });

  describe('getAllCoffees', () => {
    it('should retrieve all coffees from DynamoDB', async () => {
      const testCoffees = [
        createTestCoffee({ name: 'Coffee 1' }),
        createTestCoffee({ name: 'Coffee 2' }),
        createTestCoffee({ name: 'Coffee 3' }),
      ];

      // Insert test data
      await Promise.all(
        testCoffees.map(coffee => testSetup.insertTestCoffee(coffee))
      );
      
      const result = await dynamoService.getAllCoffees();
      
      expect(result).toHaveLength(3);
      expect(result).toEqual(expect.arrayContaining(testCoffees));
    });

    it('should return empty array when no coffees exist', async () => {
      const result = await dynamoService.getAllCoffees();
      
      expect(result).toEqual([]);
    });
  });

  describe('updateCoffee', () => {
    it('should update an existing coffee in DynamoDB', async () => {
      const testCoffee = createTestCoffee();
      await testSetup.insertTestCoffee(testCoffee);
      
      const updates = {
        name: 'Updated Coffee Name',
        price: 6.00,
        available: false,
      };
      
      const result = await dynamoService.updateCoffee(testCoffee.id, updates);
      
      expect(result).toMatchObject({
        ...testCoffee,
        ...updates,
        updatedAt: expect.any(String),
      });
      expect(result!.updatedAt).not.toBe(testCoffee.updatedAt);
      
      // Verify it was actually updated
      const updatedCoffee = await testSetup.getCoffeeById(testCoffee.id);
      expect(updatedCoffee).toMatchObject(updates);
    });

    it('should return null for non-existent coffee', async () => {
      const result = await dynamoService.updateCoffee('non-existent-id', {
        name: 'Updated Name',
      });
      
      expect(result).toBeNull();
    });
  });

  describe('deleteCoffee', () => {
    it('should delete a coffee from DynamoDB', async () => {
      const testCoffee = createTestCoffee();
      await testSetup.insertTestCoffee(testCoffee);
      
      const result = await dynamoService.deleteCoffee(testCoffee.id);
      
      expect(result).toBe(true);
      
      // Verify it was actually deleted
      const deletedCoffee = await testSetup.getCoffeeById(testCoffee.id);
      expect(deletedCoffee).toBeNull();
    });

    it('should not throw error when deleting non-existent coffee', async () => {
      const result = await dynamoService.deleteCoffee('non-existent-id');
      
      expect(result).toBe(true);
    });
  });
});