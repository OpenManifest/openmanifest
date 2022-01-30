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
            "app/": "./app",
          }
        },
      ],
      '@babel/plugin-proposal-numeric-separator',
      'react-native-reanimated/plugin',
    ],
  };
};
