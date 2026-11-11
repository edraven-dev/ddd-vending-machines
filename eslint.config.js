const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const globals = require('globals');
const tseslint = require('typescript-eslint');

// The rule adjustments the former Nx presets (plugin:@nx/typescript, plugin:@nx/javascript) made on top of the
// recommended configs, kept so linting results stay the same.
const rules = {
  '@typescript-eslint/explicit-member-accessibility': 'off',
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/no-non-null-assertion': 'warn',
  '@typescript-eslint/adjacent-overload-signatures': 'error',
  '@typescript-eslint/prefer-namespace-keyword': 'error',
  'no-empty-function': 'off',
  '@typescript-eslint/no-empty-function': 'error',
  '@typescript-eslint/no-inferrable-types': 'error',
  '@typescript-eslint/no-unused-vars': 'warn',
  '@typescript-eslint/no-empty-interface': 'error',
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/no-require-imports': 'off',
};

module.exports = [
  {
    ignores: [
      '**/.turbo',
      '**/coverage',
      '**/dist',
      '**/test-results',
      '**/jest.config.ts',
      '**/eslint.config.js',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  { files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'], rules },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules,
  },
  {
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx'],
    languageOptions: { globals: globals.jest },
  },
];
