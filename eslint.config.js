const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');
const i18next = require('eslint-plugin-i18next');
const uiConverted = require('./eslint/ui-converted');

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

// Shared with the converted-directory block below, which replaces (not extends) these rules
const layoutRestrictedImports = [
  {
    name: 'react-native',
    importNames: ['KeyboardAvoidingView', 'SafeAreaView'],
    message:
      'Use FormColumn (keyboard aware scrolling) or ScreenContainer (safe areas) from app/components/layout.',
  },
];
const layoutRestrictedSyntax = [
  {
    selector: "CallExpression[callee.object.name='Dimensions'][callee.property.name='get']",
    message:
      'Do not size layout from Dimensions.get: use flex, or useWindowDimensions() / useBreakpoint() for breakpoints.',
  },
];

const SPACING_PROPERTY =
  '/^(margin|padding)(Top|Bottom|Left|Right|Horizontal|Vertical|Start|End)?$|^(gap|rowGap|columnGap)$/';
const RAW_TOUCHABLES =
  '/^(Pressable|TouchableOpacity|TouchableWithoutFeedback|TouchableHighlight)$/';
const ACCESSIBLE_IMAGE = [
  "JSXAttribute[name.name='accessibilityLabel']",
  "JSXAttribute[name.name='aria-label']",
  "JSXAttribute[name.name='alt']",
  "JSXAttribute[name.name='accessible'][value.expression.value=false]",
].join(', ');

// UI rules for the converted directories (design plan §3.5)
const uiRestrictedSyntax = [
  ...layoutRestrictedSyntax,
  {
    selector:
      'Literal[value=/^#[0-9a-fA-F]{3,8}$/], Literal[value=/^(rgb|rgba|hsl|hsla)\\(/], Literal[value=/^(white|black)$/]',
    message: 'No colour literals: use the theme (useTheme().colour) or app/ui/tokens.',
  },
  {
    selector:
      "Property[key.name='fontSize'][value.type='Literal'], Property[key.value='fontSize'][value.type='Literal']",
    message: 'No numeric fontSize: use a type token (useTheme().type).',
  },
  {
    selector: `Property[key.name=${SPACING_PROPERTY}][value.type='Literal'][value.value!=0], Property[key.name=${SPACING_PROPERTY}][value.type='UnaryExpression']`,
    message:
      'No numeric margin, padding or gap (0 is fine): use the space tokens (useTheme().space).',
  },
  {
    selector: `JSXOpeningElement[name.name=${RAW_TOUCHABLES}] > JSXAttribute[name.name='onPress']`,
    message:
      'No raw Pressable or Touchable with onPress: use a component from app/ui (it carries role, name and target size).',
  },
  {
    selector: `JSXOpeningElement[name.name='Image']:not(:has(${ACCESSIBLE_IMAGE}))`,
    message: 'An Image needs accessibilityLabel (or accessible={false} when it is decorative).',
  },
];

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: [
      'dist/*',
      'web-build/*',
      'build/*',
      '.expo/*',
      'app/api/schema.d.ts',
      'app/api/operations.ts',
      'app/api/reflection.tsx',
    ],
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
      'no-restricted-imports': ['error', { paths: layoutRestrictedImports }],
      'no-restricted-syntax': ['error', ...layoutRestrictedSyntax],
    },
  },
  {
    // The primitives are where the platform APIs are wrapped
    files: ['app/components/layout/**'],
    rules: { 'no-restricted-imports': 'off', 'no-restricted-syntax': 'off' },
  },
  {
    // Converted directories (eslint/ui-converted.js): the UI rules are errors
    files: uiConverted.converted,
    ignores: uiConverted.exempt,
    plugins: { i18next },
    rules: {
      // Every visible string goes through t() (jsx-text-only: text between tags; props are checked by the debt counter)
      'i18next/no-literal-string': ['error', { mode: 'jsx-text-only' }],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            ...layoutRestrictedImports,
            {
              name: 'react-native-paper',
              message: 'Use the components of app/ui; Paper is being removed.',
            },
          ],
          patterns: [
            {
              group: ['react-native-paper/*'],
              message: 'Use the components of app/ui; Paper is being removed.',
            },
          ],
        },
      ],
      'no-restricted-syntax': ['error', ...uiRestrictedSyntax],
    },
  },
  {
    // Jest globals in the mocks and tests
    files: ['app/__mocks__/**', 'app/**/__tests__/**', 'jest.setup.ts'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  },
]);
