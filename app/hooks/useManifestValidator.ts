import * as React from 'react';
import useDebounce from 'react-use/lib/useDebounce';
import { useSlotEligibilityQuery } from 'app/api/reflection';
import type { EligibilityResultEssentialsFragment } from 'app/api/operations';
import type { GuestInput } from 'app/api/schema.d';

/** What the server needs to say whether somebody can be manifested: the same arguments as `slotEligibility` */
export interface ManifestValidatorInput {
  loadId?: string | null;
  membershipId?: string | null;
  ticketTypeId?: string | null;
  activityTypeId?: string | null;
  extraIds?: string[];
  equipmentIds?: string[];
  loadVehicleId?: string | null;
  groupNumber?: number | null;
  bodyMassKg?: number | null;
  guests?: GuestInput[];
}

export interface ManifestValidation {
  loading: boolean;
  results: EligibilityResultEssentialsFragment[];
  /** Rules that fail */
  failures: EligibilityResultEssentialsFragment[];
  /** Failures nobody may let through: the slot cannot be manifested until they are fixed */
  blocking: EligibilityResultEssentialsFragment[];
  /** Rules that pass but run out within 14 days */
  expiring: EligibilityResultEssentialsFragment[];
  canManifest: boolean;
}

const NONE: EligibilityResultEssentialsFragment[] = [];

/**
 * Asks the server (the only place the rules live) whether the slot being put together could be manifested, a moment
 * after the last change. Nothing is asked until there is a load, a member and a ticket.
 */
export default function useManifestValidator(
  input: ManifestValidatorInput,
  delay = 400
): ManifestValidation {
  const [settled, setSettled] = React.useState(input);
  const key = JSON.stringify(input);
  useDebounce(() => setSettled(input), delay, [key]);

  const { data, loading } = useSlotEligibilityQuery({
    variables: {
      loadId: settled.loadId as string,
      membershipId: settled.membershipId,
      ticketTypeId: settled.ticketTypeId as string,
      activityTypeId: settled.activityTypeId,
      extraIds: settled.extraIds,
      equipmentIds: settled.equipmentIds,
      loadVehicleId: settled.loadVehicleId,
      groupNumber: settled.groupNumber,
      bodyMassKg: settled.bodyMassKg,
      guests: settled.guests,
    },
    skip: !settled.loadId || !settled.membershipId || !settled.ticketTypeId,
    fetchPolicy: 'network-only',
  });

  return React.useMemo(() => {
    const results = data?.slotEligibility ?? NONE;
    const failures = results.filter((result) => !result.ok);
    const blocking = failures.filter((result) => !result.bypassed);
    return {
      loading,
      results,
      failures,
      blocking,
      expiring: results.filter((result) => result.status === 'EXPIRING'),
      canManifest: blocking.length === 0,
    };
  }, [data, loading]);
}
