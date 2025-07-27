import { DynamoDB } from 'aws-sdk';
import { Coffee, CreateCoffeeRequest, UpdateCoffeeRequest } from '../models/Coffee';

const dynamoDb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.COFFEE_TABLE!;

export class DynamoService {
  async createCoffee(coffee: Coffee): Promise<Coffee> {
    const params = {
      TableName: TABLE_NAME,
      Item: coffee,
    };

    await dynamoDb.put(params).promise();
    return coffee;
  }

  async getCoffee(id: string): Promise<Coffee | null> {
    const params = {
      TableName: TABLE_NAME,
      Key: { id },
    };

    const result = await dynamoDb.get(params).promise();
    return result.Item as Coffee || null;
  }

  async getAllCoffees(): Promise<Coffee[]> {
    const params = {
      TableName: TABLE_NAME,
    };

    const result = await dynamoDb.scan(params).promise();
    return result.Items as Coffee[] || [];
  }

  async updateCoffee(id: string, updates: UpdateCoffeeRequest): Promise<Coffee | null> {
    const existingCoffee = await this.getCoffee(id);
    if (!existingCoffee) {
      return null;
    }

    const updatedCoffee = {
      ...existingCoffee,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const params = {
      TableName: TABLE_NAME,
      Item: updatedCoffee,
    };

    await dynamoDb.put(params).promise();
    return updatedCoffee;
  }

  async deleteCoffee(id: string): Promise<boolean> {
    const params = {
      TableName: TABLE_NAME,
      Key: { id },
    };

    await dynamoDb.delete(params).promise();
    return true;
  }
}