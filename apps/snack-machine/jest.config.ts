/* eslint-disable */
export default {
  displayName: 'snack-machine',
  preset: '../../jest.preset.ts',
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
  coverageDirectory: '../../coverage/apps/snack-machine',
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results/apps/snack-machine', outputName: 'test-results.xml' }],
  ],
};
