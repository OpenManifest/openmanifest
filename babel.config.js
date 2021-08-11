module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ["module-resolver",
        {
        "root": ["./app"],
        "extensions": ['.js', '.jsx', '.es', '.es6', '.mjs', '.ts', '.tsx'],
        }
      ],
      '@babel/plugin-proposal-numeric-separator',
      ["module:react-native-dotenv", {
        "moduleName": "@env",
        "path": ".env",
        "blacklist": null,
        "whitelist": null,
        "safe": false,
        "allowUndefined": true
      }],
      'react-native-reanimated/plugin',
    ],
  };
};
