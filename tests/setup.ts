import { DynamoDB } from 'aws-sdk';

// Use LocalStack or actual DynamoDB for integration tests
const dynamoDb = new DynamoDB.DocumentClient({
  region: 'us-east-1',
  endpoint: process.env.IS_OFFLINE ? 'http://localhost:8000' : undefined,
});

export const setupTestData = async () => {
  const tableName = process.env.COFFEE_TABLE || 'test-coffee-table';
  
  // Create test coffee
  const testCoffee = {
    id: 'integration-test-coffee',
    name: 'Test Espresso',
    description: 'Test coffee for integration tests',
    price: 3.50,
    category: 'espresso',
    size: 'small',
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await dynamoDb.put({
    TableName: tableName,
    Item: testCoffee,
  }).promise();

  return testCoffee;
};

export const cleanupTestData = async () => {
  const tableName = process.env.COFFEE_TABLE || 'test-coffee-table';
  
  await dynamoDb.delete({
    TableName: tableName,
    Key: { id: 'integration-test-coffee' },
  }).promise();
};