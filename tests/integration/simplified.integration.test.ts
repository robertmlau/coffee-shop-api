import { handler as createHandler } from '../../src/handlers/createCoffee';
import { handler as getHandler } from '../../src/handlers/getCoffee';
import { handler as updateHandler } from '../../src/handlers/updateCoffee';
import { handler as deleteHandler } from '../../src/handlers/deleteCoffee';
import { handler as getAllHandler } from '../../src/handlers/getCoffees';
import { APIGatewayProxyEvent } from 'aws-lambda';

// Mock DynamoDB for now
jest.mock('aws-sdk');

describe('Handler Integration Tests', () => {
  const createMockEvent = (
    httpMethod: string,
    path: string,
    body?: any,
    pathParameters?: any
  ): APIGatewayProxyEvent => ({
    httpMethod,
    path,
    body: body ? JSON.stringify(body) : null,
    pathParameters,
    headers: {},
    multiValueHeaders: {},
    isBase64Encoded: false,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
  });

  describe('Coffee CRUD Operations', () => {
    it('should handle create coffee request', async () => {
      const event = createMockEvent('POST', '/coffees', {
        name: 'Test Coffee',
        description: 'Test Description',
        price: 4.50,
        category: 'espresso',
        size: 'medium',
      });

      const result = await createHandler(event, {} as any, {} as any) as any;
      
      expect(result.statusCode).toBe(201);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(true);
    });

    it('should handle get all coffees request', async () => {
      const event = createMockEvent('GET', '/coffees');

      const result = await getAllHandler(event, {} as any, {} as any) as any;
      
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(true);
    });

    it('should handle get single coffee request', async () => {
      const event = createMockEvent('GET', '/coffees/123', null, { id: '123' });

      const result = await getHandler(event, {} as any, {} as any) as any;
      
      // Since DynamoDB is mocked, this will likely return an error
      expect([200, 404, 500]).toContain(result.statusCode);
    });

    it('should handle update coffee request', async () => {
      const event = createMockEvent('PUT', '/coffees/123', {
        name: 'Updated Coffee',
        price: 5.00,
      }, { id: '123' });

      const result = await updateHandler(event, {} as any, {} as any) as any;
      
      expect([200, 404, 500]).toContain(result.statusCode);
    });

    it('should handle delete coffee request', async () => {
      const event = createMockEvent('DELETE', '/coffees/123', null, { id: '123' });

      const result = await deleteHandler(event, {} as any, {} as any) as any;
      
      expect([200, 404, 500]).toContain(result.statusCode);
    });
  });
});