/* eslint-disable */
export default {
  displayName: 'management',
  preset: '../../jest.preset.js',
  coverageDirectory: './coverage',
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'test-results.xml' }],
  ],
};
