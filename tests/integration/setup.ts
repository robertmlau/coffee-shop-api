// tests/integration/setup.ts
// This file is for integration test specific setup

// Set integration test environment
process.env.INTEGRATION_TEST = 'true';
process.env.NODE_ENV = 'test';
process.env.AWS_REGION = process.env.AWS_REGION || 'us-east-1';
process.env.COFFEE_TABLE = process.env.COFFEE_TABLE || 'coffee-shop-api-integration-test-coffees';

// Don't mock AWS SDK for integration tests - we want real AWS calls
// Don't mock UUID for integration tests - we want real UUIDs

console.log('🧪 Integration test environment loaded');