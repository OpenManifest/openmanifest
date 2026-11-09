import type { EligibilityResultEssentialsFragment } from 'app/api/operations';

export type Readiness =
  | { status: 'ready' }
  | { status: 'expiring'; result: EligibilityResultEssentialsFragment }
  | { status: 'blocked'; result: EligibilityResultEssentialsFragment };

/** What the rules say about a person on a load: the first rule that fails, else the first that runs out soon, else ready */
export function readinessOf(
  rules: readonly EligibilityResultEssentialsFragment[] | null | undefined
): Readiness {
  const failing = (rules ?? []).find((rule) => rule.status === 'FAIL' && !rule.bypassed);
  if (failing) return { status: 'blocked', result: failing };
  const expiring = (rules ?? []).find((rule) => rule.status === 'EXPIRING');
  if (expiring) return { status: 'expiring', result: expiring };
  return { status: 'ready' };
}
