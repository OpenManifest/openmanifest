module.exports = {
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  // for expo projects using react native
  "extends": [
    "universe/native",
    "airbnb-typescript-prettier",
    "plugin:@typescript-eslint/recommended", // Uses the recommended rules from the @typescript-eslint/eslint-plugin
      "prettier/@typescript-eslint", // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    "plugin:prettier/recommended" 
  ],
  "ignorePatterns": ["**/*.d.ts"],
  "rules": {
    // Allowed with immer
    "no-param-reassign": 0,

    'max-len': [1, { code: 100 }],

    // Allow this with stylesheets
    "@typescript-eslint/no-use-before-define": 0,

    // Fuck it, let typescript infer
    "@typescript-eslint/explicit-module-boundary-types": 0,

    "react/require-default-props": 0,

    "react/jsx-props-no-spreading": 0,

    // Console is stripped out on build anyway
    "no-console": 0,

    "no-useless-escape": 0,

    // Disagree. Named exports are clearer than defaults.
    "import/prefer-default-export": 0,

    // Dont escape text strings with html chars
    "react/no-unescaped-entities": 0
  }
}