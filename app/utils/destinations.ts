import { DestinationKind } from 'app/api/schema.d';

export type DestinationScope = 'per_slot' | 'per_load';

export interface DestinationsModule {
  kinds: DestinationKind[];
  scope: DestinationScope | null;
}

/**
 * What the operator's destinations module says (`operator.modules.destinations`): which kinds of place it can create and
 * whether every slot has a destination of its own or a load visits an ordered list. `null` when the module is off.
 */
export function destinationsModule(
  modules?: Record<string, unknown> | null
): DestinationsModule | null {
  const config = modules?.destinations;
  if (!config) return null;
  const { kinds, scope } = (typeof config === 'object' ? config : {}) as {
    kinds?: unknown;
    scope?: unknown;
  };
  return {
    kinds: Array.isArray(kinds) ? (kinds as DestinationKind[]) : [],
    scope: scope === 'per_slot' || scope === 'per_load' ? scope : null,
  };
}
