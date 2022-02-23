import { UserRigDetailedFragment } from 'app/api/operations';
import { useAvailableRigsLazyQuery } from 'app/api/reflection';
import * as React from 'react';
import { useTheme } from 'react-native-paper';
import { useAppSelector } from 'app/state';
import Chip from 'app/components/chips/Chip';
import Select, { ISelectOption } from '../select/Select';

interface IRigSelect {
  dropzoneUserId?: number;
  value?: UserRigDetailedFragment | null;
  tandem?: boolean;
  small?: boolean;
  backgroundColor?: string;
  color?: string;
  autoSelectFirst?: boolean;
  onSelect(rig: UserRigDetailedFragment): void;
}

export default function RigSelect(props: IRigSelect) {
  const {
    dropzoneUserId,
    value,
    small,
    color: assignedColor,
    backgroundColor,
    autoSelectFirst,
    onSelect,
    tandem,
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
          isTandem: tandem || undefined,
        },
      });
    }
  }, [fetchRigs, currentDropzoneId, tandem, dropzoneUserId]);

  React.useEffect(() => {
    if (!value && autoSelectFirst && data?.availableRigs?.length) {
      onSelect(data.availableRigs[0]);
    }
  }, [autoSelectFirst, data?.availableRigs, onSelect, value]);

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
      {...{ options, renderAnchor }}
      value={selected}
      onChange={onSelect}
    />
  );
}
