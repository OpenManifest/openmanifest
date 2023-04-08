// Metro bundler *REFUSES* to parse any typescript other than
// the app.config.ts file itself, and even that file is proxied,
// so to get around this, we have to use a js file to import.
// This file proxies the import to the typescript file so we get
// typechecking and all that good stuff.
require('ts-node/register');
module.exports = require('./constants.ts');
