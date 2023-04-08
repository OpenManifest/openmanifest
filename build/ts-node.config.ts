/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
// !!IMPORTANT!!
// Import this file BEFORE importing any other modules that call ts-node/register,
// like expo's app.config.js (which proxies app.config.ts with ts-node)
// This is done automatically if the script is run with yarn ts:exec

// If ts-node imports another module that calls ts-node/register,
// which is already called by the executable, then strange errors
// occurs. Setting ts-node.register to noop fixes this:
// https://github.com/TypeStrong/ts-node/issues/409#issuecomment-407228078
require('ts-node').register = function noop() {
  return undefined;
};
