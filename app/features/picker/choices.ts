import type { SlotDefaults } from './members';

/** What the person changed from the member's last slot: the ticket, the type of jump and where it goes */
export type SlotChoice = {
  ticketTypeId?: string | null;
  activityTypeId?: string | null;
  destinationId?: string | null;
};

/** The parts of a ticket the picker needs: its price, where it goes and who it takes along */
export type TicketOption = {
  id: string;
  name: string;
  costCents: number;
  requiresEscort: boolean;
  escortCapacity: number;
  participantLimits?: unknown;
  defaultDestination?: { id: string } | null;
};

/**
 * The slot to book: the member's last one, with the ticket and activity the person chose over it. A different ticket
 * has its own price and destination, and none of the old ticket's extras.
 */
export function resolveDefaults(
  base: SlotDefaults,
  choice: SlotChoice,
  tickets: readonly TicketOption[]
): SlotDefaults {
  const chosen = choice.ticketTypeId ? tickets.find(({ id }) => id === choice.ticketTypeId) : null;
  const changed = !!chosen && chosen.id !== base.ticketTypeId;
  return {
    ...base,
    ticketTypeId: chosen?.id ?? base.ticketTypeId,
    activityTypeId: choice.activityTypeId ?? base.activityTypeId,
    destinationId:
      choice.destinationId ??
      (changed ? (chosen.defaultDestination?.id ?? null) : base.destinationId),
    extraIds: changed ? [] : base.extraIds,
    costCents: changed ? chosen.costCents : base.costCents,
  };
}

/** The group number for the next group on a load: one after the highest in use */
export function nextGroupNumber(
  slots: readonly { groupNumber?: number | null }[] | null | undefined
) {
  return (
    (slots ?? []).reduce((highest, { groupNumber }) => Math.max(highest, groupNumber ?? 0), 0) + 1
  );
}
