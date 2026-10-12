# Test utilities

- `renderWithProviders(ui, options)` (`render.tsx`): theme, terms, Apollo mocks, operator and manifest contexts, a signed
  in session with a role's permissions and a window size. Options: `role` (`owner`, `manifest`, `fun_jumper`, `student`;
  their permissions are synced from the backend's `config/industries/skydiving/presets.yml` with `yarn sync:roles`),
  `permissions`, `scheme`, `breakpoint` (`compact` 390 px, `medium` 820 px, `expanded` 1440 px), `mocks` (Apollo
  `MockedResponse`s), `industry` (the words of a template), `session`.
- `hosts.ts`: queries by host element type, for what has no role, text or test id (inputs of a form, a scroll view). Test
  Renderer only renders host elements, so `UNSAFE_getAllByType` is gone: use `textInputs(screen.container)`,
  `hostsOfType(screen.container, 'RCTScrollView')`, `hostsWhere(root, predicate)`, `scoped(element)`.

Query by role first (`getByRole('button', { name: 'Save' })`), then text, then test id.

RNTL 14 is async: `await render(…)`, `await fireEvent.press(…)`, `await act(…)`, `await screen.unmount()`. Do not run
several `fireEvent`s or `act`s at once (`Promise.all`, `forEach` without `await`): overlapping `act` calls break React's
act queue and the next render comes out empty.

Fixtures of the API (`createMockedQuery`) return a new object per call, so a test's overrides never leak into the next.
