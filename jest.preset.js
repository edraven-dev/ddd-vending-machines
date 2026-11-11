// Shared Jest preset for the NestJS apps and libs (`preset: '../../jest.preset.js'`).
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(e2e-spec|spec|test).[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.[tj]s$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'typescript', decorators: true, dynamicImport: true },
          transform: { legacyDecorator: true, decoratorMetadata: true },
          target: 'es2021',
        },
        sourceMaps: true,
      },
    ],
  },
  // Workspace libs are TypeScript source packages, so they must be transformed too.
  transformIgnorePatterns: ['/node_modules/(?!@vending-machines/)'],
  coverageProvider: 'v8',
  collectCoverageFrom: [
    './src/**/*.ts',
    '!./src/**/*.module.ts',
    '!./src/main.ts',
    '!./src/**/index.ts',
    '!./src/database/**',
  ],
};
