/* eslint-disable */
export default {
  displayName: 'events',
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
  coverageDirectory: '../../coverage/libs/events',
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results/libs/events', outputName: 'test-results.xml' }],
  ],
};
