import * as React from 'react';
import { useOperatorContext } from 'app/providers/operator/context';
import {
  decide,
  destinationsFor,
  type AccessDecision,
  type AccessRule,
  type Destination,
} from './destinations';

/** What the shell needs to know about the current user and operator, once it is known */
export function useAccess() {
  const {
    operator: { permissions, permissionsLoaded, operator, currentUser },
  } = useOperatorContext();

  return React.useMemo(
    () => ({
      ready: permissionsLoaded && !!operator,
      access: {
        permissions,
        modules: (operator?.modules ?? {}) as Record<string, unknown>,
        moderationRole: currentUser?.user?.moderationRole,
      },
    }),
    [permissions, permissionsLoaded, operator, currentUser?.user?.moderationRole]
  );
}

/**
 * The destinations of the current user at the current operator. `ready` is false until the permissions and the operator
 * have arrived: show a splash, not an empty shell.
 */
export default function useDestinations(): { ready: boolean; destinations: Destination[] } {
  const { ready, access } = useAccess();

  return React.useMemo(
    () => ({ ready, destinations: ready ? destinationsFor(access) : [] }),
    [ready, access]
  );
}

/** `loading` until the permissions are known, then the decision for a rule (a screen's guard) */
export function useAccessDecision(rule: AccessRule): AccessDecision | 'loading' {
  const { ready, access } = useAccess();

  return ready ? decide(rule, access) : 'loading';
}
