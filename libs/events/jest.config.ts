/* eslint-disable */
export default {
  displayName: 'events',
  preset: '../../jest.preset.js',
  moduleFileExtensions: ['ts', 'js', 'html'],
  collectCoverage: true,
  collectCoverageFrom: [
    './src/**/*.ts',
    '!./src/**/*.module.ts',
    '!./src/main.ts',
    '!./src/**/index.ts',
    '!./src/database/**',
  ],
  coverageDirectory: './coverage',
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'test-results.xml' }],
  ],
};
