import i18n from 'app/i18n';

/** "chase_vehicle" as words, for a kind the template has no term for: "Chase vehicle" */
function humanize(kind: string): string {
  const words = kind.replace(/[_-]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * The operator's name of a vehicle kind (the template's `terms.vehicle_kind`: "Helicopter", "Chase vehicle"), or the
 * kind's key as words
 */
export function vehicleKindName(kind: string, count = 1): string {
  return i18n.t(`terms:vehicle_kind.${kind}`, { count, defaultValue: humanize(kind) });
}

/** The kinds a vehicle can be: a choice only for an operator that runs more than one (a balloon and a chase vehicle) */
export function vehicleKindOptions(kinds: readonly string[] | null | undefined) {
  const list = kinds ?? [];
  return list.length > 1 ? list.map((kind) => ({ value: kind, label: vehicleKindName(kind) })) : [];
}
