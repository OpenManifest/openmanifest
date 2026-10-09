const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

// Rules that report findings in the existing code. They are warnings until the code is cleaned up (the counts are in
// the P3.20 pull request); everything else from eslint-config-expo is an error.
const knownFindings = [
  // React Compiler rules of eslint-plugin-react-hooks
  'react-hooks/refs',
  'react-hooks/preserve-manual-memoization',
  'react-hooks/set-state-in-effect',
  'react-hooks/static-components',
  'react-hooks/immutability',
  'react-hooks/use-memo',
  'react-hooks/rules-of-hooks',
  // React
  'react/jsx-key',
  'react/no-unescaped-entities',
  'react/display-name',
];

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', 'web-build/*', 'build/*', '.expo/*', 'app/api/schema.d.ts', 'app/api/operations.ts', 'app/api/reflection.tsx'],
  },
  {
    rules: {
      ...Object.fromEntries(knownFindings.map((rule) => [rule, 'warn'])),
      // Tell us when we miss dependencies in hooks
      'react-hooks/exhaustive-deps': 'error',
    },
  },
  {
    // Phase 5 layout rules (BUGS.md RC2-RC4): screens use ScreenContainer / FormColumn and flex, not these
    files: ['app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: ['KeyboardAvoidingView', 'SafeAreaView'],
              message:
                'Use FormColumn (keyboard aware scrolling) or ScreenContainer (safe areas) from app/components/layout.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.object.name='Dimensions'][callee.property.name='get']",
          message:
            'Do not size layout from Dimensions.get: use flex, or useWindowDimensions() / useBreakpoint() for breakpoints.',
        },
      ],
    },
  },
  {
    // The primitives are where the platform APIs are wrapped
    files: ['app/components/layout/**'],
    rules: { 'no-restricted-imports': 'off', 'no-restricted-syntax': 'off' },
  },
  {
    // Jest globals in the mocks and tests
    files: ['app/__mocks__/**', 'app/**/__tests__/**', 'jest.setup.ts'],
    languageOptions: { globals: { jest: 'readonly', describe: 'readonly', it: 'readonly', expect: 'readonly', beforeEach: 'readonly', afterEach: 'readonly', beforeAll: 'readonly', afterAll: 'readonly' } },
  },
]);
