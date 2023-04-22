module.exports = {
  "extends": [
    "plugin:react-hooks/recommended"
  ],
  "root": true,
  "parser": "@typescript-eslint/parser",
  "ignorePatterns": [
    "/*.*",
    "node_modules"
  ],
  "rules": {
    // Tell us when we miss dependencies in hooks
    "react-hooks/exhaustive-deps": "error"
  },
  "settings": {
    "import/ignore": [
      "node_modules"
    ]
  }
}