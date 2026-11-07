import type { WeatherConditionEssentialsFragment } from 'app/api/operations';
import { fromSi, toSi, unitOf, type Quantity, type UnitSystem } from 'app/i18n/units';

/** The `conditions` module of an operator whose conditions are winds aloft (the skydiving template) */
export const WINDS_ALOFT = 'winds_aloft';

/** Does the operator keep the winds aloft of the day? `operator.modules` holds `conditions: { kind: 'winds_aloft' }` */
export function hasWindsAloft(modules: unknown): boolean {
  if (!modules || typeof modules !== 'object') return false;
  const conditions = (modules as Record<string, unknown>).conditions;
  return (
    !!conditions &&
    typeof conditions === 'object' &&
    (conditions as Record<string, unknown>).kind === WINDS_ALOFT
  );
}

/** The feed gives nine heights; a few more leave room for the operator's own */
export const MAX_WINDS = 12;
export const HEADING_MAX = 359;

/** A wind as it is edited: a height and a speed in the operator's units, the direction it blows from in degrees */
export type WindDraft = {
  altitude: number | null;
  speed: number | null;
  direction: number | null;
  /** The temperature the feed measured at that height (°C); kept as it is, not edited */
  temperatureC?: number | null;
};

/** The conditions as they are edited, in the operator's units; `null` is an empty field */
export type ConditionsDraft = {
  temperature: number | null;
  jumpRun: number | null;
  winds: WindDraft[];
};

export type Conditions = Pick<
  WeatherConditionEssentialsFragment,
  'winds' | 'jumpRun' | 'temperatureC'
>;

const round = (value: number, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const shown = (quantity: Quantity, si: number | null | undefined, units: UnitSystem, digits = 0) =>
  si === null || si === undefined
    ? null
    : round(fromSi(quantity, si, unitOf(quantity, units)), digits);

const si = (quantity: Quantity, value: number, units: UnitSystem) =>
  round(toSi(quantity, value, unitOf(quantity, units)), 2);

/** The conditions in the operator's units, highest wind first */
export function draftOf(
  conditions: Conditions | null | undefined,
  units: UnitSystem
): ConditionsDraft {
  const winds = [...(conditions?.winds ?? [])].sort(
    (a, b) => (b.altitudeM ?? 0) - (a.altitudeM ?? 0)
  );
  return {
    temperature: shown('temperature', conditions?.temperatureC, units, 1),
    jumpRun: typeof conditions?.jumpRun === 'number' ? conditions.jumpRun : null,
    winds: winds.map((wind) => ({
      altitude: shown('altitude', wind.altitudeM, units),
      speed: shown('speed', wind.speedMps, units),
      direction: typeof wind.direction === 'number' ? Math.round(wind.direction) : null,
      temperatureC: wind.temperatureC ?? null,
    })),
  };
}

/** A new row under the others: the person types its height */
export const emptyWind = (): WindDraft => ({ altitude: null, speed: 0, direction: 0 });

export type Problem = 'required' | 'heading' | 'negative' | 'tooMany';

/** What keeps the conditions from being saved, by field (`temperature`, `jumpRun`, `winds.2.direction`, `winds`) */
export function problemsOf(draft: ConditionsDraft): Record<string, Problem> {
  const problems: Record<string, Problem> = {};
  const heading = (key: string, value: number | null) => {
    if (value === null) problems[key] = 'required';
    else if (!Number.isInteger(value) || value < 0 || value > HEADING_MAX)
      problems[key] = 'heading';
  };
  if (draft.temperature === null) problems.temperature = 'required';
  heading('jumpRun', draft.jumpRun);
  if (draft.winds.length > MAX_WINDS) problems.winds = 'tooMany';
  draft.winds.forEach((wind, index) => {
    for (const field of ['altitude', 'speed'] as const) {
      const value = wind[field];
      if (value === null) problems[`winds.${index}.${field}`] = 'required';
      else if (value < 0) problems[`winds.${index}.${field}`] = 'negative';
    }
    heading(`winds.${index}.direction`, wind.direction);
  });
  return problems;
}

/** What the API takes (SI, the winds as JSON, highest first); call it only when `problemsOf` found nothing */
export function inputOf(draft: ConditionsDraft, units: UnitSystem) {
  const winds = draft.winds
    .map((wind) => ({
      altitude_m: si('altitude', wind.altitude ?? 0, units),
      speed_mps: si('speed', wind.speed ?? 0, units),
      direction: wind.direction ?? 0,
      ...(typeof wind.temperatureC === 'number' ? { temperature_c: wind.temperatureC } : {}),
    }))
    .sort((a, b) => b.altitude_m - a.altitude_m);
  return {
    winds: JSON.stringify(winds),
    temperatureC: si('temperature', draft.temperature ?? 0, units),
    jumpRun: draft.jumpRun ?? 0,
  };
}
