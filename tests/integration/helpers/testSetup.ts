import { DynamoDB } from 'aws-sdk';
import { Coffee } from '../../../src/models/Coffee';

export class IntegrationTestSetup {
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
      KeySchema: [
        {
          AttributeName: 'id',
          KeyType: 'HASH',
        },
      ],
      AttributeDefinitions: [
        {
          AttributeName: 'id',
          AttributeType: 'S',
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    };

    try {
      await dynamodb.createTable(params).promise();
      await dynamodb.waitFor('tableExists', { TableName: this.tableName }).promise();
      console.log(`✅ Test table ${this.tableName} created successfully`);
    } catch (error: any) {
      if (error.code !== 'ResourceInUseException') {
        throw error;
      }
      console.log(`ℹ️  Test table ${this.tableName} already exists`);
    }
  }

  async deleteTestTable(): Promise<void> {
    const dynamodb = new DynamoDB({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
    });

    try {
      await dynamodb.deleteTable({ TableName: this.tableName }).promise();
      console.log(`🗑️  Test table ${this.tableName} deleted`);
    } catch (error: any) {
      if (error.code !== 'ResourceNotFoundException') {
        console.error('Error deleting test table:', error);
      }
    }
  }

  async cleanupTestData(): Promise<void> {
    try {
      const result = await this.dynamoDb.scan({
        TableName: this.tableName,
      }).promise();

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

  getTableName(): string {
    return this.tableName;
  }
}