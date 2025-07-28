// Global test setup
import { jest } from '@jest/globals';

// Mock AWS SDK
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

// Mock UUID
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123'),
}));

// Suppress console.error during tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});