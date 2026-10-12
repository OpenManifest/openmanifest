# Spike: `@rn-primitives` for overlays on the web (U0.8)

**Decision: go**, for dialog, select, tabs, popover and tooltip on the web, with two rules for the select (below). Native is
not decided here: it is checked with TalkBack and VoiceOver in the Checkpoint U2.8 owner list.

## What was tried

`@rn-primitives/{dialog,select,tabs,popover,tooltip}` 1.5.2 and `portal` 1.5.3 (peers `*`; on the web they wrap Radix UI
primitives). A dev-only route `/__spike` (`app/screens/dev/SpikeScreen.tsx`; web outside production, removed with U2.3)
renders one of each, unstyled. `e2e/spike.spec.ts` (tag `@spike`, `yarn test:ui:smoke --grep @spike`) drives them with the
keyboard in Chromium at 390 and 1440 px: 6 tests, all pass in both sizes.

| Primitive                       | Result                                                                                                                                                                                                                      |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dialog                          | `role="dialog"` named by its title and described by its description; focus moves inside on open and Tab/Shift+Tab never leave it (6 steps each way); Escape closes it and focus returns to the trigger.                     |
| Select                          | Opens with Enter or Space, arrows move the highlight, Enter selects and focus returns to the trigger, Escape closes without changing the value; `role="listbox"` with three `role="option"`. **Needs the two rules below.** |
| Tabs                            | `tablist`, `tab` (`aria-selected`), `tabpanel`; ArrowRight moves focus to the next tab, Enter selects it, only the selected tab is in the tab order (roving tabindex).                                                      |
| Popover                         | Opens with Enter, closes with Escape, focus returns to the trigger.                                                                                                                                                         |
| Tooltip                         | Shows on keyboard focus (not only hover), `role="tooltip"`, Escape hides it.                                                                                                                                                |
| axe (WCAG 2.0/2.1/2.2 A and AA) | No serious or critical violation on the spike page. The only finding is the app's own viewport meta tag (`maximum-scale`, moderate), which is not part of this task.                                                        |

## The two rules for the select

1. **`Select.Viewport` is required around the items.** Without it the arrow keys do nothing (focus stays on the first
   option); with it they move and Enter selects the highlighted one.
2. **The trigger must be our own `Pressable` with `role="combobox"`, passed with `asChild`.** `Select.Trigger` drops its
   `role` prop and the React Native Web `Pressable` it renders sets `role="button"` over Radix's `combobox`, which leaves
   Radix's `aria-autocomplete` on a button: axe reports `aria-allowed-attr` (critical) and a screen reader announces a
   button, not a combobox. `<Select.Trigger asChild><Pressable role="combobox" aria-label="…">…</Pressable></Select.Trigger>`
   gives `role="combobox"`, `aria-expanded` and no violation.

The U2.3 `Select` wraps both, so screens never see them.

## Cost

- Bundle (web export, `EXPO_ENV=local`, Metro): JS 7,484,922 → 7,694,963 B (+210 kB raw, +2.8 %) with the five primitives
  and the spike route (not measured per primitive); `dist/` 14,696 → 14,900 kB.
- 31 `@radix-ui/*` packages, `@floating-ui/*`, `react-remove-scroll` and `@rn-primitives/{hooks,slot,types}` enter the
  lockfile (+461 lines). They are web-only code paths; native uses rn-primitives' own implementation.

## Not covered

- Native behaviour (VoiceOver, TalkBack, the native select and dialog): owner check at U2.8.
- Interplay with React Navigation modals and with `@gorhom/bottom-sheet` (`Sheet`): checked while building U2.3 and U2.4.
- Screen readers on the web (NVDA, VoiceOver for macOS): the roles, names and states above are what they read; a spot check
  is in the U2.8 owner list.
- `@rn-primitives/portal` needs a `<PortalHost />` near the root of whatever renders overlays; the app already uses
  `@gorhom/portal`, so U2.3 decides which host the overlays use.

## For U2.3

Build `Dialog`, `Select`, `Tabs`, `Popover` and `Tooltip` in `app/ui` on these primitives on the web, keeping the
`Select.web.tsx`, `Menu.web.tsx` and `DialogOrSheet.web.tsx` names for the web files. If a later check on a device finds a
native blocker, only the native file falls back to our own implementation.
