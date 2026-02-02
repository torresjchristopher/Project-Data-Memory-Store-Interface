#!/bin/bash
# TEST RUNNER - Run database tests independently

# Install Jest and types (if not already installed)
npm install -D jest @types/jest ts-jest

# Create jest.config.js
cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/services/**/*.ts',
    '!src/services/**/*.test.ts',
    '!src/services/__tests__/**'
  ],
  testPathIgnorePatterns: ['/node_modules/'],
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx',
        target: 'ES2022',
        module: 'commonjs',
        moduleResolution: 'node'
      }
    }
  }
};
EOF

echo "✅ Jest configured!"
echo ""
echo "Run tests with:"
echo "  npm test -- DatabaseService.test.ts"
echo "  npm test -- PersistenceService.test.ts"
echo "  npm test                              (run all)"
echo "  npm test -- --coverage               (with coverage)"
