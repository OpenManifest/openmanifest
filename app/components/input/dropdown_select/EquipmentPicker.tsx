import * as React from 'react';
import type {
  EquipmentEssentialsFragment,
  EquipmentKindEssentialsFragment,
} from 'app/api/operations';
import { useOperatorContext } from 'app/providers/operator/context';
import { RIG_KIND } from 'app/features/skydiving/rig';
import { withHookForm } from '../withHookForm';
import EquipmentSelect from './EquipmentSelect';

type RequiredBy = {
  always?: boolean;
  ticket_type_ids?: (string | number)[];
  activity_type_ids?: (string | number)[];
};

/** Does a slot with this ticket type and activity type need an item of the kind? */
export function kindRequired(
  kind: Pick<EquipmentKindEssentialsFragment, 'requiredBy'>,
  slot: { ticketTypeId?: string | null; activityTypeId?: string | null }
): boolean {
  const requiredBy = (kind.requiredBy ?? {}) as RequiredBy;
  if (requiredBy.always) return true;
  const listed = (ids?: (string | number)[], id?: string | null) =>
    !!id && (ids ?? []).map(String).includes(String(id));
  return (
    listed(requiredBy.ticket_type_ids, slot.ticketTypeId) ||
    listed(requiredBy.activity_type_ids, slot.activityTypeId)
  );
}

/** The kinds of an operator that a slot needs an item of */
export function requiredKinds<K extends Pick<EquipmentKindEssentialsFragment, 'requiredBy'>>(
  kinds: K[] | null | undefined,
  slot: { ticketTypeId?: string | null; activityTypeId?: string | null }
): K[] {
  return (kinds ?? []).filter((kind) => kindRequired(kind, slot));
}

interface IEquipmentPicker {
  membershipId?: number;
  loadId?: number;
  ticketTypeId?: string | null;
  activityTypeId?: string | null;
  /** Skydiving: a tandem instructor's rig is a tandem rig */
  tandem?: boolean;
  value?: EquipmentEssentialsFragment[] | null;
  small?: boolean;
  variant?: 'chip' | 'select';
  autoSelectFirst?: boolean;
  error?: string | null;
  onChange(equipment: EquipmentEssentialsFragment[]): void;
}

/**
 * What a slot uses, one item for each kind of equipment that slot needs (a rig; a BCD, a regulator and a wetsuit): a
 * select for every required kind of the operator that puts its choice in the list.
 */
function EquipmentPicker(props: IEquipmentPicker) {
  const {
    membershipId,
    loadId,
    ticketTypeId,
    activityTypeId,
    tandem,
    value,
    small,
    variant,
    autoSelectFirst,
    error,
    onChange,
  } = props;
  const {
    operator: { operator },
  } = useOperatorContext();
  const kinds = requiredKinds(operator?.equipmentKinds, { ticketTypeId, activityTypeId });
  const chosen = React.useMemo(() => value ?? [], [value]);
  // Every select reports into the same list: a change is made on what is chosen by now
  const latest = React.useRef(chosen);
  latest.current = chosen;

  const onChangeKind = React.useCallback(
    (key: string, item: EquipmentEssentialsFragment) => {
      const others = latest.current.filter((candidate) => candidate.equipmentKind?.key !== key);
      onChange([...others, item]);
    },
    [onChange]
  );

  return (
    <>
      {kinds.map((kind) => (
        <EquipmentSelect
          key={kind.id}
          kind={kind.key}
          label={kind.name}
          {...{ membershipId, loadId, small, variant, autoSelectFirst, error }}
          tandem={tandem && kind.key === RIG_KIND}
          value={chosen.find((item) => item.equipmentKind?.key === kind.key) as never}
          onChange={(item) => onChangeKind(kind.key, item)}
        />
      ))}
    </>
  );
}

export const EquipmentPickerField = withHookForm(EquipmentPicker);

export default EquipmentPicker;
