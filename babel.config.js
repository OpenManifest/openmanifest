module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: '.',
          extensions: ['.js', '.jsx', '.es', '.es6', '.mjs', '.ts', '.tsx'],
          alias: {
            '^app/(.+)': './app/\\1',
          },
        },
      ],
      '@babel/plugin-proposal-numeric-separator',
      '@babel/plugin-proposal-logical-assignment-operators',
      '@babel/plugin-proposal-export-namespace-from',
      // react-native-worklets/plugin (Reanimated 4) is added last by babel-preset-expo when react-native-worklets is installed
    ],
  };
};
