set -e

STAGE=${1:-dev}
REGION=${2:-us-east-1}

echo "🚀 Deploying Coffee Shop API to $STAGE environment in $REGION region..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests
echo "🧪 Running tests..."
npm test

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Deploy with Serverless
echo "☁️ Deploying to AWS..."
npx serverless deploy --stage $STAGE --region $REGION

echo "✅ Deployment completed successfully!"
echo "🌐 API Gateway URL:"
npx serverless info --stage $STAGE --region $REGION | grep "endpoints:" -A 10