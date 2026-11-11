/* eslint-disable */
export default {
  displayName: 'event-store',
  preset: '../../jest.preset.js',
  coverageDirectory: './coverage',
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'test-results.xml' }],
  ],
};
