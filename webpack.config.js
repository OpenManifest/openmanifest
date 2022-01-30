const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        ...env.babel,
        // Fixes:
        // ./node_modules/color/index.js 272:26
        // Module parse failed: Identifier directly after number (272:26)
        dangerouslyAddModulePathsToTranspile: ['color'],
      },
    },
    argv
  );
  // Customize the config before returning it.
  return config;
};
