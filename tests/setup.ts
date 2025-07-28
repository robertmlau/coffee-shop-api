// tests/setup.ts
import { jest } from '@jest/globals';

// Mock AWS SDK for unit tests
jest.mock('aws-sdk', () => ({
  DynamoDB: {
    DocumentClient: jest.fn(() => ({
      get: jest.fn(),
      put: jest.fn(),
      scan: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    })),
  },
}));

// Mock UUID for consistent testing
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123'),
}));

// Set test environment variables
process.env.COFFEE_TABLE = 'test-coffee-table';
process.env.STAGE = 'test';
process.env.AWS_REGION = 'us-east-1';

// Suppress console.error during unit tests (optional)
const originalError = console.error;
const originalLog = console.log;

beforeAll(() => {
  // Only suppress errors in unit tests, not integration tests
  if (!process.env.INTEGRATION_TEST) {
    console.error = jest.fn();
    console.log = jest.fn();
  }
});

afterAll(() => {
  console.error = originalError;
  console.log = originalLog;
});