import * as React from 'react';
import { useOperatorQuery } from 'app/api/reflection';
import environment from 'app/constants/environment';
import { useSession } from 'app/state/session';
import { applyTerms } from './index';
import type { Terms } from './terms';
// The fixtures are synced from the backend templates (scripts/sync-terminology.mjs)
import generic from './fixtures/generic.json';
import skydiving from './fixtures/skydiving.json';

export const FIXTURES: Record<string, Terms> = { generic, skydiving };

/** The terms of `?industry=<slug>` on the web outside production (the `full` Playwright project, the gallery) */
export function industryOverride(
  search: string | undefined = typeof window === 'undefined' ? undefined : window.location?.search,
  env: string = environment
): Terms | null {
  if (env === 'production' || !search) return null;
  const slug = new URLSearchParams(search).get('industry');
  return slug && FIXTURES[slug] ? FIXTURES[slug] : null;
}

/**
 * Keeps the `terms` namespace in step with the current operator: its `terminology` (the template's words with its own
 * changes) when logged in, the generic words otherwise. `terms` wins over both (tests and the gallery pass a fixture).
 */
export default function useOperatorTerms(terms?: Terms | null) {
  const operatorId = useSession((session) => session.currentOperatorId);
  const loggedIn = useSession((session) => !!session.credentials);
  const { data, previousData } = useOperatorQuery({
    variables: { operatorId: operatorId || '' },
    skip: !operatorId || !loggedIn,
  });
  // Keep the previous operator's words while the next one loads rather than flashing the defaults
  const terminology = (data ?? previousData)?.operator?.terminology as Terms | undefined;
  const override = React.useMemo(() => terms ?? industryOverride(), [terms]);
  const effective = override ?? terminology ?? null;

  // The first render already has the right words (nothing listens to the store yet). Later changes are applied in an
  // effect: children subscribe to the store in their own effects, which run before this one, so they see the change.
  const applied = React.useRef<Terms | null | undefined>(undefined);
  if (applied.current === undefined) {
    applied.current = effective;
    applyTerms(effective);
  }
  React.useEffect(() => {
    if (applied.current !== effective) {
      applied.current = effective;
      applyTerms(effective);
    }
  }, [effective]);
}
