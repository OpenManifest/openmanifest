export interface LimitsModule {
  age: boolean;
  mass: boolean;
  payload: boolean;
}

/**
 * What the operator's limits module watches (`operator.modules.limits`): ages and body masses of the people on a ticket,
 * and what the vehicles can carry. `null` when the module is off.
 */
export function limitsModule(modules?: Record<string, unknown> | null): LimitsModule | null {
  const config = modules?.limits;
  if (!config) return null;
  const flags = (typeof config === 'object' ? config : {}) as Record<string, unknown>;
  return { age: flags.age === true, mass: flags.mass === true, payload: flags.payload === true };
}
