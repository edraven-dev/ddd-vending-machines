/* eslint-disable */
export default {
  displayName: 'snack-machine',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: { '^.+\\.[tj]s$': ['@swc/jest', { jsc: { target: 'es5' } }] }, // FIXME: change target
  testMatch: ['**/?(*.)+(e2e-spec|spec|test).[jt]s?(x)'],
  coverageDirectory: '../../coverage/apps/snack-machine',
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results/apps/snack-machine', outputName: 'test-results.xml' }],
  ],
};
