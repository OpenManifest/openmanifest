import { getCalendars, getLocales } from 'expo-localization';
import { IANAZone } from 'luxon';
import type { CertificationBodyEssentialsFragment, IndustriesQuery } from 'app/api/operations';
import type { Industry } from 'app/api/schema.d';
import { DEFAULT_CURRENCY } from 'app/i18n/format';
import { UNIT_CHOICES, type Quantity } from 'app/i18n/units';
import { DEFAULT_BRAND } from 'app/ui';
import { DEFAULT_TIME_ZONE, resolveTimeZone } from 'app/utils/operatorTime';
import { CURRENCIES } from 'app/features/setup/rules';

/** An industry template as the wizard gets it from the API */
export type IndustryTemplate = IndustriesQuery['industries'][number];

/** The groups of the industry step: the template's family (GENERALISATION §6), "other" for the generic template */
export type IndustryGroup = 'air' | 'water' | 'land' | 'other';

export const GROUPS: IndustryGroup[] = ['air', 'water', 'land', 'other'];

const GROUP_OF_BASE: Record<string, IndustryGroup> = {
  _aviation: 'air',
  _water: 'water',
  _ground: 'land',
};

/** The group a template is shown in: by the abstract base at the root of what it extends */
export function groupOf(industry: Pick<IndustryTemplate, 'base'>): IndustryGroup {
  return (industry.base && GROUP_OF_BASE[industry.base]) || 'other';
}

/** The templates of each group, in name order; empty groups are left out */
export function groupIndustries(
  industries: IndustryTemplate[]
): { group: IndustryGroup; industries: IndustryTemplate[] }[] {
  return GROUPS.map((group) => ({
    group,
    industries: industries
      .filter((industry) => groupOf(industry) === group)
      .sort((a, b) => a.name.localeCompare(b.name)),
  })).filter(({ industries: inGroup }) => inGroup.length > 0);
}

/** The steps of the wizard, in order */
export type StepKey =
  'industry' | 'name' | 'location' | 'money' | 'certifications' | 'branding' | 'review' | 'done';

/** The steps for a template: the certification bodies only when its certifications module is on */
export function stepsFor(industry?: Pick<IndustryTemplate, 'modules'> | null): StepKey[] {
  const certifications = !!industry?.modules.includes('certifications');
  return [
    'industry',
    'name',
    'location',
    'money',
    ...(certifications ? (['certifications'] as StepKey[]) : []),
    'branding',
    'review',
    'done',
  ];
}

export type WizardValues = {
  /** Set once the operator has been created: going back and forward updates it instead */
  id: string | null;
  industry: Industry | null;
  name: string;
  timeZone: string;
  lat: number | null;
  lng: number | null;
  currency: string;
  units: Partial<Record<Quantity, string>>;
  certificationBodies: CertificationBodyEssentialsFragment[];
  primaryColor: string;
  banner: string;
  /** Prices of the preset ticket types, by id, in the currency's main unit; only the ones changed */
  prices: Record<string, number | null>;
  vehicleName: string;
  vehicleRegistration: string;
  vehicleCapacity: number | null;
  /** Set once the first vehicle has been created */
  vehicleId: string | null;
};

/** The device's time zone and currency (expo-localization), or the server's defaults */
export function localeDefaults(): { timeZone: string; currency: string } {
  let timeZone: string | null = null;
  let currency: string | null = null;
  try {
    timeZone = getCalendars()[0]?.timeZone ?? null;
    currency = getLocales()[0]?.currencyCode ?? null;
  } catch {
    // No locale information (tests, an old browser): the defaults below
  }
  return {
    timeZone: timeZone && IANAZone.isValidZone(timeZone) ? timeZone : resolveTimeZone(),
    currency: currency && /^[A-Z]{3}$/.test(currency) ? currency : DEFAULT_CURRENCY,
  };
}

export function initialValues(): WizardValues {
  const { timeZone, currency } = localeDefaults();
  return {
    id: null,
    industry: null,
    name: '',
    timeZone: timeZone || DEFAULT_TIME_ZONE,
    lat: null,
    lng: null,
    currency,
    units: {},
    certificationBodies: [],
    primaryColor: DEFAULT_BRAND,
    banner: '',
    prices: {},
    vehicleName: '',
    vehicleRegistration: '',
    vehicleCapacity: null,
    vehicleId: null,
  };
}

/** The currencies offered: the usual ones, and the device's own when it is not one of them */
export function currencyChoices(current: string): string[] {
  return CURRENCIES.includes(current) ? CURRENCIES : [current, ...CURRENCIES];
}

/** The quantities whose unit the template sets, in the order of the unit lists, each with its choices */
export function unitQuantitiesOf(units: unknown): Quantity[] {
  const keys = Object.keys((units ?? {}) as object);
  return (Object.keys(UNIT_CHOICES) as Quantity[]).filter((quantity) => keys.includes(quantity));
}

/** What picking a template changes: its units; the certification bodies of another template go */
export function withIndustry(values: WizardValues, industry: IndustryTemplate): WizardValues {
  if (values.industry === industry.slug) return values;
  return {
    ...values,
    industry: industry.slug,
    units: { ...((industry.units ?? {}) as WizardValues['units']) },
    certificationBodies: [],
  };
}

/** Error keys (`onboarding.errors.*`) by field */
export type WizardErrors = Partial<Record<keyof WizardValues, string>>;

/** What stops the wizard from leaving a step; empty when it may go on */
export function validateStep(step: StepKey, values: WizardValues): WizardErrors {
  switch (step) {
    case 'industry':
      return values.industry ? {} : { industry: 'industryRequired' };
    case 'name':
      return values.name.trim() ? {} : { name: 'nameRequired' };
    case 'location':
      return IANAZone.isValidZone(values.timeZone.trim()) ? {} : { timeZone: 'timeZoneInvalid' };
    case 'money':
      return /^[A-Z]{3}$/.test(values.currency) ? {} : { currency: 'currencyRequired' };
    case 'certifications':
      return values.certificationBodies.length ? {} : { certificationBodies: 'bodiesRequired' };
    case 'branding':
      return values.primaryColor ? {} : { primaryColor: 'colourRequired' };
    case 'review': {
      if (!values.vehicleName.trim() || values.vehicleId) return {};
      const errors: WizardErrors = {};
      if (!values.vehicleRegistration.trim()) errors.vehicleRegistration = 'registrationRequired';
      if (!values.vehicleCapacity) errors.vehicleCapacity = 'capacityRequired';
      return errors;
    }
    default:
      return {};
  }
}

/** The step that shows a field, to go back to a field the server rejected */
export function stepOfField(field: string): StepKey | undefined {
  const steps: Record<string, StepKey> = {
    industry: 'industry',
    name: 'name',
    timeZone: 'location',
    lat: 'location',
    lng: 'location',
    currency: 'money',
    units: 'money',
    certificationBodies: 'certifications',
    certificationBodyIds: 'certifications',
    primaryColor: 'branding',
    banner: 'branding',
  };
  return steps[field];
}

/** The attributes the operator is created or updated with */
export function operatorAttributes(values: WizardValues, industry?: IndustryTemplate | null) {
  const certifications = !!industry?.modules.includes('certifications');
  return {
    name: values.name.trim(),
    timeZone: values.timeZone.trim(),
    lat: values.lat,
    lng: values.lng,
    currency: values.currency,
    units: values.units,
    certificationBodyIds: certifications
      ? values.certificationBodies.map(({ id }) => Number(id))
      : [],
    primaryColor: values.primaryColor,
    ...(values.banner ? { banner: values.banner } : {}),
  };
}

/** Cents of a price in the currency's main unit (12.5 → 1250) */
export function centsOf(price: number | null | undefined): number {
  return Math.round((price ?? 0) * 100);
}
