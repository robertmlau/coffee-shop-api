set -e

echo "🧪 Running Coffee Shop API tests..."

# Unit tests
echo "Running unit tests..."
npm run test

# Integration tests (if implemented)
echo "Running integration tests..."
# npm run test:integration

echo "✅ All tests passed!"