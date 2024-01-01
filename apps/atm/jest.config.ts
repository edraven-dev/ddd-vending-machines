/* eslint-disable */
export default {
  displayName: 'atm',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: { '^.+\\.[tj]s$': ['@swc/jest'] },
  testMatch: ['**/?(*.)+(e2e-spec|spec|test).[jt]s?(x)'],
  coverageDirectory: '../../coverage/apps/atm',
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results/apps/atm', outputName: 'test-results.xml' }],
  ],
};
