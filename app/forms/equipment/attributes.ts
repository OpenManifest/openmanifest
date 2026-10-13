import { format } from 'date-fns';
import type { Quantity } from 'app/i18n/units';
import { fromSi, unitOf, UNIT_SYMBOLS, type UnitSystem } from 'app/i18n/units';
import { parseQuantity } from 'app/i18n/format';

/**
 * What an item of a kind of equipment records is described by the kind's attribute schema (EquipmentKind.attributeSchema,
 * seeded from the industry template): the screens draw their fields from it and nothing in here knows what a rig or a
 * wetsuit is.
 */
export type AttributeType = 'string' | 'integer' | 'decimal' | 'enum' | 'date';

export type AttributeSpec = {
  type: AttributeType;
  label?: string;
  values?: string[];
  required?: boolean;
  default?: string | number;
  min?: number;
  max?: number;
  /** The quantity of a number: it is stored SI and shown in the operator's unit */
  unit?: Quantity;
  /** Only equipment of the operator has it: a member's own is left without it */
  operator_only?: boolean;
  not_rentable?: string[];
};

export type AttributeSchema = Record<string, AttributeSpec>;
export type AttributeValues = Record<string, string | number | null | undefined>;

/** "canopy_size_m2" → "Canopy size m2": the label a schema without one falls back to */
export const humanize = (name: string): string => {
  const words = name.replace(/_/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export const labelOf = (name: string, spec: AttributeSpec): string => spec.label ?? humanize(name);

export function schemaOf(attributeSchema: unknown): AttributeSchema {
  return attributeSchema && typeof attributeSchema === 'object'
    ? (attributeSchema as AttributeSchema)
    : {};
}

/** The attributes an item of an owner records: the ones only operators have are left out for a member's own */
export function attributesFor(
  schema: AttributeSchema,
  options: { operatorOwned: boolean }
): [string, AttributeSpec][] {
  return Object.entries(schema).filter(([, spec]) => options.operatorOwned || !spec.operator_only);
}

/** The text a person edits: a number in the operator's unit, a date as yyyy-MM-dd */
export function toInputText(
  spec: AttributeSpec,
  value: AttributeValues[string],
  units?: UnitSystem | null
): string {
  if (value === null || value === undefined || value === '') return '';
  if (spec.unit && typeof value === 'number') {
    const shown = fromSi(spec.unit, value, unitOf(spec.unit, units));
    return String(Math.round(shown * 100) / 100);
  }
  return String(value);
}

/** What the text a person typed means for the attribute: SI for a quantity; null when empty or not valid */
export function fromInputText(
  spec: AttributeSpec,
  text: string,
  units?: UnitSystem | null
): string | number | null {
  const trimmed = text.trim();
  if (trimmed === '') return null;
  switch (spec.type) {
    case 'integer': {
      const number = spec.unit ? parseQuantity(trimmed, spec.unit, units) : Number(trimmed);
      return number === null || Number.isNaN(number) ? null : Math.round(number);
    }
    case 'decimal': {
      const number = spec.unit ? parseQuantity(trimmed, spec.unit, units) : Number(trimmed);
      return number === null || Number.isNaN(number) ? null : Math.round(number * 10000) / 10000;
    }
    default:
      return trimmed;
  }
}

/** The value as it is shown in a list: "190 ft²", "Sport", "2026-03-04" */
export function formatAttribute(
  spec: AttributeSpec,
  value: AttributeValues[string],
  units?: UnitSystem | null
): string {
  if (value === null || value === undefined || value === '') return '-';
  if (spec.unit && typeof value === 'number') {
    const unit = unitOf(spec.unit, units);
    const shown = Math.round(fromSi(spec.unit, value, unit) * 10) / 10;
    return `${shown} ${UNIT_SYMBOLS[unit]}`;
  }
  if (spec.type === 'enum') return humanize(String(value));
  if (spec.type === 'date') {
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? String(value) : format(date, 'yyyy/MM/dd');
  }
  return String(value);
}

/** "Main canopy size: 190 ft² · Rig type: Sport" */
export function summarize(
  schema: AttributeSchema,
  values: AttributeValues | null | undefined,
  options: { operatorOwned: boolean; units?: UnitSystem | null }
): string {
  return attributesFor(schema, options)
    .filter(([name]) => values?.[name] !== undefined && values?.[name] !== null)
    .map(
      ([name, spec]) =>
        `${labelOf(name, spec)}: ${formatAttribute(spec, values?.[name], options.units)}`
    )
    .join(' · ');
}

/** The problems of the values against the schema, before the server tells them; names → message */
export function validateAttributes(
  schema: AttributeSchema,
  values: AttributeValues,
  options: { operatorOwned: boolean }
): Record<string, string> {
  const problems: Record<string, string> = {};
  attributesFor(schema, options).forEach(([name, spec]) => {
    const value = values[name];
    const label = labelOf(name, spec);
    if (value === null || value === undefined || value === '') {
      if (spec.required) problems[name] = `${label} is required`;
      return;
    }
    if (typeof value === 'number') {
      if (spec.min !== undefined && value < spec.min)
        problems[name] = `${label} must be at least ${spec.min}`;
      if (spec.max !== undefined && value > spec.max)
        problems[name] = `${label} must be at most ${spec.max}`;
    }
    if (spec.type === 'enum' && !(spec.values ?? []).includes(String(value))) {
      problems[name] = `${label} must be one of ${(spec.values ?? []).join(', ')}`;
    }
  });
  return problems;
}
