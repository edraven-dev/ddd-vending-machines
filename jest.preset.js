const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  collectCoverage: true,
  coverageProvider: 'v8',
  collectCoverageFrom: [
    './src/**/*.ts',
    '!./src/**/*.module.ts',
    '!./src/main.ts',
    '!./src/**/index.ts',
    '!./src/database/**',
  ],
  moduleFileExtensions: ['ts', 'js'],
};
