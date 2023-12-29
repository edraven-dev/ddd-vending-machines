/* eslint-disable */
export default {
  displayName: 'event-store',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: { '^.+\\.[tj]s$': ['@swc/jest'] },
  testMatch: ['**/?(*.)+(e2e-spec|spec|test).[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  collectCoverage: true,
  collectCoverageFrom: [
    './src/**/*.ts',
    '!./src/**/*.module.ts',
    '!./src/main.ts',
    '!./src/**/index.ts',
    '!./src/database/**',
  ],
  coverageDirectory: '../../coverage/apps/event-store',
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results/apps/event-store', outputName: 'test-results.xml' }],
  ],
};
