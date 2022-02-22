import { DropzoneUserEssentialsFragment } from 'app/api/operations';
import { useDropzoneUsersQuery } from 'app/api/reflection';
import * as React from 'react';
import { useTheme } from 'react-native-paper';
import { Permission } from '../../api/schema.d';
import useRestriction from '../../hooks/useRestriction';
import { useAppSelector } from '../../state';
import Select, { ISelectOption } from '../input/select/Select';
import Chip from './Chip';

interface IPilotChipSelect {
  small?: boolean;
  backgroundColor?: string;
  color?: string;
  value?: { id: string; user: { id: string; name?: string | null } } | null;
  onSelect(user: { id: string; user: { id: string; name?: string | null } }): void;
}

export default function PilotChip(props: IPilotChipSelect) {
  const { small, color: assignedColor, backgroundColor, onSelect, value } = props;
  const theme = useTheme();
  const color = assignedColor || theme.colors.onSurface;
  const { currentDropzoneId } = useAppSelector((root) => root.global);

  const { data } = useDropzoneUsersQuery({
    variables: {
      dropzoneId: Number(currentDropzoneId),
      permissions: [Permission.ActAsPilot],
    },
  });
  const allowed = useRestriction(Permission.UpdateLoad);

  const options = React.useMemo(
    () =>
      data?.dropzone?.dropzoneUsers?.edges
        ?.filter((edge) => !!edge?.node)
        .map((edge) => ({
          label: edge?.node?.user?.name || '',
          value: edge?.node as DropzoneUserEssentialsFragment,
          avatar: edge?.node?.user?.image,
        })) || [],
    [data?.dropzone?.dropzoneUsers?.edges]
  );

  const selected = React.useMemo(
    () =>
      data?.dropzone?.dropzoneUsers?.edges
        ?.map((edge) => edge?.node)
        .find((node) => node?.id === value?.id),
    [data?.dropzone?.dropzoneUsers?.edges, value?.id]
  );

  const renderAnchor: React.FC<{
    item?: ISelectOption<DropzoneUserEssentialsFragment>;
    openMenu(): void;
  }> = React.useCallback(
    ({ item, openMenu }) => (
      <Chip {...{ backgroundColor, small, color, onPress: openMenu }} icon="shield-airplane">
        {item?.label || 'No Pilot'}
      </Chip>
    ),
    [backgroundColor, color, small]
  );

  return !allowed ? (
    <Chip {...{ backgroundColor, small, color }} icon="shield-airplane">
      {value?.user?.name || 'No Pilot'}
    </Chip>
  ) : (
    <Select<DropzoneUserEssentialsFragment>
      value={selected}
      options={options}
      renderAnchor={renderAnchor}
      onChange={onSelect}
    />
  );
}
