import type { ResourceFact } from 'app/ui';
import { formatDestination, formatQuantity } from 'app/i18n/format';
import { formatCents } from 'app/utils/money';

/** `t` of the `common` namespace, and the operator's terms (`term('vehicle', 2)`) */
export type Translate = (key: string, options?: Record<string, unknown>) => string;
export type Term = (key: string, count?: number) => string;

/** Leaves out the facts without a value */
function facts(list: (ResourceFact | null | false | undefined)[]): ResourceFact[] {
  return list.filter((fact): fact is ResourceFact => !!fact && fact.value !== '');
}

export function vehicleFacts(
  vehicle: {
    registration?: string | null;
    minCapacity?: number | null;
    capacity?: number | null;
    maxPayloadKg?: number | null;
  },
  t: Translate
): ResourceFact[] {
  const min = vehicle.minCapacity ?? 1;
  const max = vehicle.capacity ?? 0;
  return facts([
    { label: t('forms.vehicle.registration'), value: vehicle.registration ?? '' },
    {
      label: t('resources.facts.seats'),
      value: min > 1 && min < max ? `${min}–${max}` : String(max),
    },
    !!vehicle.maxPayloadKg && {
      label: t('resources.facts.payload'),
      value: formatQuantity(vehicle.maxPayloadKg, 'mass'),
    },
  ]);
}

export function ticketFacts(
  ticket: {
    costCents?: number | null;
    defaultDestination?: { name?: string | null; kind?: string | null; altitudeM?: number | null } | null;
    allowManifestingSelf?: boolean | null;
    requiresEscort?: boolean | null;
  },
  t: Translate,
  term: Term
): ResourceFact[] {
  return facts([
    { label: t('forms.ticket_type.price'), value: formatCents(ticket.costCents) },
    !!ticket.defaultDestination && {
      label: term('destination'),
      value: formatDestination(ticket.defaultDestination),
    },
    !!ticket.requiresEscort && {
      label: term('escort'),
      value: t('resources.facts.yes'),
    },
    {
      label: t('resources.facts.public'),
      value: t(ticket.allowManifestingSelf ? 'resources.facts.yes' : 'resources.facts.no'),
    },
  ]);
}

export function extraFacts(
  extra: { costCents?: number | null; ticketTypes?: readonly { name?: string | null }[] | null },
  t: Translate
): ResourceFact[] {
  return facts([
    { label: t('forms.ticket_type_addon.price'), value: formatCents(extra.costCents) },
    !!extra.ticketTypes?.length && {
      label: t('resources.facts.tickets'),
      value: extra.ticketTypes
        .map((ticket) => ticket.name)
        .filter(Boolean)
        .join(', '),
    },
  ]);
}

export function crewRoleFacts(
  role: {
    scope?: string | null;
    required?: boolean | null;
    occupiesSlot?: boolean | null;
    permission?: string | null;
  },
  t: Translate,
  term: Term
): ResourceFact[] {
  const words = {
    load: term('load').toLowerCase(),
    vehicle: term('vehicle').toLowerCase(),
    equipment: term('equipment'),
  };
  return facts([
    {
      label: t('forms.crew_role.scope'),
      value: t(`forms.crew_role.scopes.${role.scope === 'vehicle' ? 'vehicle' : 'load'}`, words),
    },
    {
      label: t('forms.crew_role.required'),
      value: t(role.required ? 'resources.facts.yes' : 'resources.facts.no'),
    },
    !!role.occupiesSlot && {
      label: t('forms.crew_role.occupiesSlot'),
      value: t('resources.facts.yes'),
    },
    {
      label: t('forms.crew_role.permission'),
      value: role.permission
        ? t(`profile.acting.${role.permission}`, { ...words, defaultValue: role.permission })
        : t('forms.crew_role.anyone'),
    },
  ]);
}

/** A kind of equipment and its inspection form: how long a service and an inspection last, and what it checks */
export function equipmentKindFacts(
  kind: {
    serviceIntervalDays?: number | null;
    inspectionValidDays?: number | null;
    inspectionFormTemplate?: { definition?: string | null } | null;
  },
  t: Translate
): ResourceFact[] {
  return facts([
    !!kind.serviceIntervalDays && {
      label: t('resources.facts.service'),
      value: t('resources.facts.days', { count: kind.serviceIntervalDays }),
    },
    !!kind.inspectionFormTemplate && {
      label: t('resources.facts.checks'),
      value: String(fieldCount(kind.inspectionFormTemplate.definition)),
    },
    !!kind.inspectionFormTemplate && {
      label: t('resources.facts.inspectionValid'),
      value: kind.inspectionValidDays
        ? t('resources.facts.days', { count: kind.inspectionValidDays })
        : t('resources.facts.untilReplaced'),
    },
  ]);
}

/** How many fields an inspection form's definition (JSON) has; 0 when it cannot be read */
export function fieldCount(definition?: string | null): number {
  if (!definition) return 0;
  try {
    const parsed = JSON.parse(definition);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

/** The bodies an operator could still accept: those of its industry (or of none) it does not accept yet */
export function bodiesToAdd<Body extends { id: string; industry?: string | null }>(
  all: readonly Body[],
  accepted: readonly { id: string }[],
  industry?: string | null
): Body[] {
  const taken = new Set(accepted.map((body) => body.id));
  return all.filter(
    (body) => !taken.has(body.id) && (!industry || !body.industry || body.industry === industry)
  );
}
