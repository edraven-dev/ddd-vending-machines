/* eslint-disable */
export default {
  displayName: 'management',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: { '^.+\\.[tj]s$': ['@swc/jest'] },
  testMatch: ['**/?(*.)+(e2e-spec|spec|test).[jt]s?(x)'],
  coverageDirectory: '../../coverage/apps/management',
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results/apps/management', outputName: 'test-results.xml' }],
  ],
};
