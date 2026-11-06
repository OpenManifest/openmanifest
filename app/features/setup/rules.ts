import type { OperatorEssentialsFragment } from 'app/api/operations';
import type { OperatorInput, SettingsInput } from 'app/api/schema.d';
import { unitOf, type Quantity, type UnitSystem } from 'app/i18n/units';
import { MAX_CALLS } from 'app/utils/callSchedule';

export { MAX_CALLS };

/** The money an operator can sell in; ISO 4217 */
export const CURRENCIES = [
  'AUD',
  'NZD',
  'USD',
  'CAD',
  'GBP',
  'EUR',
  'CHF',
  'ZAR',
  'AED',
  'THB',
  'JPY',
];

/** The quantities whose unit the operator picks, in the order the page shows them */
export const UNIT_QUANTITIES: Quantity[] = [
  'altitude',
  'distance',
  'mass',
  'area',
  'speed',
  'temperature',
];

/** The on/off rules of `operator.settings` */
export type RuleKey =
  | 'allowSelfManifest'
  | 'allowDoubleManifesting'
  | 'requireCredits'
  | 'allowNegativeCredits'
  | 'requireMembership'
  | 'requireCertification'
  | 'requireEquipment'
  | 'requireEquipmentInspection'
  | 'requireEquipmentInService'
  | 'allowManifestBypass';

export type RuleSection = 'booking' | 'eligibility';

export type RuleSwitch = {
  key: RuleKey;
  section: RuleSection;
  /** Shown only when the operator has this module */
  module?: string;
};

/** Every rule, with the section it is in and the module it belongs to */
export const RULES: RuleSwitch[] = [
  { key: 'allowSelfManifest', section: 'booking' },
  { key: 'allowDoubleManifesting', section: 'booking' },
  { key: 'requireCredits', section: 'eligibility' },
  { key: 'allowNegativeCredits', section: 'eligibility' },
  { key: 'requireMembership', section: 'eligibility' },
  { key: 'requireCertification', section: 'eligibility', module: 'certifications' },
  { key: 'requireEquipment', section: 'eligibility', module: 'equipment' },
  { key: 'requireEquipmentInspection', section: 'eligibility', module: 'equipment' },
  { key: 'requireEquipmentInService', section: 'eligibility', module: 'equipment' },
  { key: 'allowManifestBypass', section: 'eligibility' },
];

/** What the API answers for a rule nobody has set (the neutral value of `Operators::Configuration`) */
const NEUTRAL: Record<RuleKey, boolean> = {
  allowSelfManifest: true,
  allowDoubleManifesting: false,
  requireCredits: true,
  allowNegativeCredits: false,
  requireMembership: true,
  requireCertification: true,
  requireEquipment: true,
  requireEquipmentInspection: true,
  requireEquipmentInService: true,
  allowManifestBypass: false,
};

/** The rules of a section that apply to an operator with these modules */
export function rulesIn(section: RuleSection, modules: Record<string, unknown> = {}): RuleSwitch[] {
  return RULES.filter(
    (rule) => rule.section === section && (!rule.module || rule.module in modules)
  );
}

export type CallProblem = 'notWhole' | 'full' | 'taken';

/** Why `minutes` cannot join the schedule, or null when it can */
export function callProblem(schedule: number[], minutes: number | null): CallProblem | null {
  if (minutes === null || !Number.isInteger(minutes) || minutes <= 0) return 'notWhole';
  if (schedule.includes(minutes)) return 'taken';
  if (schedule.length >= MAX_CALLS) return 'full';
  return null;
}

/** The schedule with a call `minutes` before departure, longest first; the same schedule when it cannot join */
export function addCall(schedule: number[], minutes: number | null): number[] {
  if (callProblem(schedule, minutes) !== null) return schedule;
  return [...schedule, minutes as number].sort((a, b) => b - a);
}

export function removeCall(schedule: number[], minutes: number): number[] {
  return schedule.filter((call) => call !== minutes);
}

export type ModuleSwitch = {
  name: string;
  on: boolean;
  /** The template keeps it on: shown, but cannot be switched off */
  locked: boolean;
};

const isLocked = (config: unknown) =>
  !!config && typeof config === 'object' && (config as { locked?: unknown }).locked === true;

/**
 * The modules an operator can switch: the template's (on unless the operator turned them off), then any other the
 * operator has on. `operatorModules` is `operator.modules`, which lists only the modules that are on.
 */
export function moduleSwitches(
  templateModules: string[],
  operatorModules: Record<string, unknown> = {}
): ModuleSwitch[] {
  const names = [...new Set([...templateModules, ...Object.keys(operatorModules)])];
  return names.map((name) => ({
    name,
    on: name in operatorModules,
    locked: isLocked(operatorModules[name]),
  }));
}

/** What the rules page edits */
export type RulesValues = {
  rules: Record<RuleKey, boolean>;
  callScheduleMinutes: number[];
  units: Record<Quantity, string>;
  currency: string;
  /** name → on, for the modules of `moduleSwitches` */
  modules: Record<string, boolean>;
};

type RulesOperator = Pick<
  OperatorEssentialsFragment,
  'name' | 'settings' | 'callScheduleMinutes' | 'units' | 'currency' | 'modules'
>;

/** The values of the page for an operator; `switches` are its module switches */
export function rulesOf(operator: RulesOperator, switches: ModuleSwitch[] = []): RulesValues {
  const settings = (operator.settings ?? {}) as Partial<Record<RuleKey, boolean | null>>;
  const units = (operator.units ?? {}) as UnitSystem;
  return {
    rules: Object.fromEntries(
      RULES.map(({ key }) => [key, settings[key] ?? NEUTRAL[key]])
    ) as Record<RuleKey, boolean>,
    callScheduleMinutes: [...(operator.callScheduleMinutes ?? [])],
    units: Object.fromEntries(
      UNIT_QUANTITIES.map((quantity) => [quantity, unitOf(quantity, units)])
    ) as Record<Quantity, string>,
    currency: operator.currency ?? 'AUD',
    modules: Object.fromEntries(switches.map((module) => [module.name, module.on])),
  };
}

/**
 * The `updateOperator` attributes that save the page. The settings go back whole (every rule, the call schedule and the
 * units the operator already had, with the changes), and only the modules that changed are sent.
 */
export function rulesInput(
  operator: RulesOperator,
  initial: RulesValues,
  values: RulesValues
): OperatorInput {
  const changedModules = Object.entries(values.modules).filter(
    ([name, on]) => initial.modules[name] !== on
  );
  const current = Object.fromEntries(
    Object.entries(operator.settings ?? {}).filter(
      ([key, value]) => key !== '__typename' && value !== null && value !== undefined
    )
  );
  const settings: SettingsInput = {
    ...current,
    ...values.rules,
    callScheduleMinutes: values.callScheduleMinutes,
    units: { ...((operator.units ?? {}) as UnitSystem), ...values.units },
  };
  return {
    name: operator.name ?? '',
    currency: values.currency,
    settings,
    ...(changedModules.length ? { modules: Object.fromEntries(changedModules) } : {}),
  };
}
