// Directories whose code follows the UI rules of the design plan §3.5 and the definition of done (MODERNISATION_PLAN,
// "Client UI work"). The rules in eslint.config.js are errors here and counted as debt (scripts/ui-debt.mjs) elsewhere.
// A screen directory is added to `converted` in the task that converts it.
module.exports = {
  converted: [
    'app/ui/**/*.{ts,tsx}',
    'app/navigation/**/*.{ts,tsx}',
    'app/screens/authenticated/account/**/*.{ts,tsx}',
  ],
  // Tokens are where the literal values live; tests and fixtures may use any value
  exempt: [
    'app/ui/tokens/**',
    'app/ui/**/__tests__/**',
    'app/ui/**/*.test.{ts,tsx}',
    'app/navigation/**/__tests__/**',
    'app/navigation/**/*.test.{ts,tsx}',
  ],
};
