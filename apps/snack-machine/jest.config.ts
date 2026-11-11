/* eslint-disable */
export default {
  displayName: 'snack-machine',
  preset: '../../jest.preset.js',
  // FIXME: change target. es5 avoids the TDZ error from the circular slot <-> snack-machine entity imports
  // (same workaround as webpack.config.cjs); the options repeat the preset's because an override replaces them.
  transform: {
    '^.+\\.[tj]s$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'typescript', decorators: true, dynamicImport: true },
          transform: { legacyDecorator: true, decoratorMetadata: true },
          target: 'es5',
        },
        sourceMaps: true,
      },
    ],
  },
  coverageDirectory: './coverage',
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'test-results.xml' }],
  ],
};
