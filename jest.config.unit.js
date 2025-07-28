module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests/unit'],
    testMatch: ['**/tests/unit/**/*.test.ts'],
    collectCoverageFrom: [
      'src/**/*.ts',
      '!src/**/*.d.ts',
    ],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    verbose: false,
    testTimeout: 10000,
  };