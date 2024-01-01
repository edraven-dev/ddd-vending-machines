/* eslint-disable */
export default {
  displayName: 'event-store',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: { '^.+\\.[tj]s$': ['@swc/jest'] },
  testMatch: ['**/?(*.)+(e2e-spec|spec|test).[jt]s?(x)'],
  coverageDirectory: '../../coverage/apps/event-store',
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results/apps/event-store', outputName: 'test-results.xml' }],
  ],
};
