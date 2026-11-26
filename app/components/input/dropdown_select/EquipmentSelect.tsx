import { UserEquipmentDetailedFragment } from 'app/api/operations';
import { kindIcon } from 'app/features/kinds';
import useTerms from 'app/i18n/useTerms';
import { useAvailableEquipmentLazyQuery } from 'app/api/reflection';
import * as React from 'react';
import { useTheme } from 'app/ui';
import { useSession } from 'app/state';
import Chip from 'app/components/chips/Chip';
import Select, { ISelectOption } from '../select/Select';
import { withHookForm } from '../withHookForm';

interface IEquipmentSelect {
  membershipId?: number;
  loadId?: number;
  value?: UserEquipmentDetailedFragment | null;
  tandem?: boolean;
  /** Only items of the equipment kind with this key */
  kind?: string;
  small?: boolean;
  backgroundColor?: string;
  color?: string;
  autoSelectFirst?: boolean;
  variant?: 'chip' | 'select';
  label?: string;
  error?: string | null;
  onChange(equipment: UserEquipmentDetailedFragment): void;
}

function EquipmentSelect(props: IEquipmentSelect) {
  const {
    membershipId,
    label,
    variant,
    value,
    small,
    loadId,
    color: assignedColor,
    backgroundColor,
    autoSelectFirst,
    onChange,
    tandem,
    kind,
    error,
  } = props;
  const term = useTerms();
  const currentOperatorId = useSession((session) => session.currentOperatorId);
  const theme = useTheme();
  const color = assignedColor || theme.colour.text;
  const [fetchEquipment, { data }] = useAvailableEquipmentLazyQuery({
    fetchPolicy: 'cache-and-network',
  });

  React.useEffect(() => {
    if (membershipId) {
      fetchEquipment({
        variables: {
          membershipId,
          loadId,
          isTandem: tandem || undefined,
          kind,
        },
      });
    }
  }, [fetchEquipment, currentOperatorId, tandem, kind, membershipId, loadId]);

  React.useEffect(() => {
    if (!value && autoSelectFirst && data?.availableEquipment?.length) {
      onChange(data.availableEquipment[0]);
    }
  }, [autoSelectFirst, data?.availableEquipment, onChange, value]);

  const options = React.useMemo(
    () =>
      data?.availableEquipment?.map((equipment) => ({
        label: equipment?.name || [equipment?.make, equipment?.model].join(' '),
        value: equipment as UserEquipmentDetailedFragment,
      })) || [],
    [data?.availableEquipment]
  );

  const selected = React.useMemo(
    () => data?.availableEquipment?.find((node) => node?.id === value?.id),
    [data?.availableEquipment, value?.id]
  );

  const renderAnchor: React.FC<{
    item?: ISelectOption<UserEquipmentDetailedFragment>;
    openMenu(): void;
  }> = React.useCallback(
    ({ item, openMenu }) => (
      <Chip {...{ backgroundColor, small, color, onPress: openMenu }} icon={kindIcon(kind)}>
        {item?.label || `No ${term('equipment').toLowerCase()}`}
      </Chip>
    ),
    [backgroundColor, color, small, kind, term]
  );

  return (
    <Select<UserEquipmentDetailedFragment>
      {...{ options, error, renderAnchor: variant === 'chip' ? renderAnchor : undefined, label }}
      value={selected}
      onChange={onChange}
    />
  );
}

export const EquipmentSelectField = withHookForm(EquipmentSelect);

export default EquipmentSelect;
