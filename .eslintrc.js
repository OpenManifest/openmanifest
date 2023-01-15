module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  // for expo projects using react native
  extends: [
    'universe/native',
    'airbnb-typescript-prettier',
    // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:@typescript-eslint/recommended',
    // Uses eslint-config-prettier to disable ESLint rules from
    // @typescript-eslint/eslint-plugin that would conflict with prettier
    'plugin:prettier/recommended',
  ],
  settings: {
    'import/resolver': {
      'babel-module': {},
    },
  },
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  ignorePatterns: ['**/*.d.ts', 'node_modules'],
  rules: {
    // Allowed with immer
    'no-underscore-dangle': 0,
    'no-param-reassign': 0,

    // FIXME: Turn this on and fix all usecases
    'react/no-unstable-nested-components': 0,

    'max-len': [1, { code: 100 }],

    // Allow this with stylesheets
    '@typescript-eslint/no-use-before-define': 0,

    // Fuck it, let typescript infer
    '@typescript-eslint/explicit-module-boundary-types': 0,

    'react/require-default-props': 0,

    'react/jsx-props-no-spreading': 0,

    // Console is stripped out on build anyway
    'no-console': 0,

    'no-useless-escape': 0,

    // Disagree. Named exports are clearer than defaults.
    'import/prefer-default-export': 0,

    // Dont escape text strings with html chars
    'react/no-unescaped-entities': 0,
  },
};
