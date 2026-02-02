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
