import { UserRigDetailedFragment } from 'app/api/operations';
import { useAvailableRigsLazyQuery } from 'app/api/reflection';
import * as React from 'react';
import { useTheme } from 'react-native-paper';
import { useAppSelector } from 'app/state';
import Chip from 'app/components/chips/Chip';
import Select, { ISelectOption } from '../select/Select';
import { withHookForm } from '../withHookForm';

interface IRigSelect {
  dropzoneUserId?: number;
  loadId?: number;
  value?: UserRigDetailedFragment | null;
  tandem?: boolean;
  small?: boolean;
  backgroundColor?: string;
  color?: string;
  autoSelectFirst?: boolean;
  variant?: 'chip' | 'select';
  label?: string;
  error?: string | null;
  onChange(rig: UserRigDetailedFragment): void;
}

function RigSelect(props: IRigSelect) {
  const {
    dropzoneUserId,
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
    error,
  } = props;
  const { currentDropzoneId } = useAppSelector((root) => root.global);
  const theme = useTheme();
  const color = assignedColor || theme.colors.onSurface;
  const [fetchRigs, { data }] = useAvailableRigsLazyQuery({
    fetchPolicy: 'cache-and-network',
  });

  React.useEffect(() => {
    if (dropzoneUserId) {
      fetchRigs({
        variables: {
          dropzoneUserId,
          loadId,
          isTandem: tandem || undefined,
        },
      });
    }
  }, [fetchRigs, currentDropzoneId, tandem, dropzoneUserId, loadId]);

  React.useEffect(() => {
    if (!value && autoSelectFirst && data?.availableRigs?.length) {
      onChange(data.availableRigs[0]);
    }
  }, [autoSelectFirst, data?.availableRigs, onChange, value]);

  const options = React.useMemo(
    () =>
      data?.availableRigs?.map((rig) => ({
        label: rig?.name || [rig?.make, rig?.model].join(' '),
        value: rig as UserRigDetailedFragment,
      })) || [],
    [data?.availableRigs]
  );

  const selected = React.useMemo(
    () => data?.availableRigs?.find((node) => node?.id === value?.id),
    [data?.availableRigs, value?.id]
  );

  const renderAnchor: React.FC<{
    item?: ISelectOption<UserRigDetailedFragment>;
    openMenu(): void;
  }> = React.useCallback(
    ({ item, openMenu }) => (
      <Chip {...{ backgroundColor, small, color, onPress: openMenu }} icon="parachute">
        {item?.label || 'No Rig'}
      </Chip>
    ),
    [backgroundColor, color, small]
  );

  return (
    <Select<UserRigDetailedFragment>
      {...{ options, error, renderAnchor: variant === 'chip' ? renderAnchor : undefined, label }}
      value={selected}
      onChange={onChange}
    />
  );
}

export const RigSelectField = withHookForm(RigSelect);

export default RigSelect;
