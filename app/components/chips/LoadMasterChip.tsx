import { DropzoneUserEssentialsFragment, SlotDetailsFragment } from 'app/api/operations';
import { truncate } from 'lodash';
import * as React from 'react';
import { useTheme } from 'react-native-paper';
import { Permission } from '../../api/schema.d';
import useRestriction from '../../hooks/useRestriction';
import Select, { ISelectOption } from '../input/select/Select';
import Chip from './Chip';

interface ILoadMasterChipSelect {
  value?: { id: string; user: { id: string; name?: string | null } } | null;
  small?: boolean;
  backgroundColor?: string;
  color?: string;

  slots: SlotDetailsFragment[];
  onSelect(user: { id: string; user: { id: string; name?: string | null } }): void;
}

export default function LoadMasterChip(props: ILoadMasterChipSelect) {
  const { small, color: assignedColor, backgroundColor, value, onSelect, slots } = props;
  const theme = useTheme();
  const color = assignedColor || theme.colors.onSurface;
  const allowed = useRestriction(Permission.UpdateLoad);

  const options = React.useMemo(
    () =>
      slots?.map((slot) => ({
        label: slot?.dropzoneUser?.user?.name || '',
        value: slot?.dropzoneUser as DropzoneUserEssentialsFragment,
        avatar: slot?.dropzoneUser?.user?.image,
      })) || [],
    [slots]
  );

  const selected = React.useMemo(
    () => slots?.map((slot) => slot?.dropzoneUser)?.find((node) => node?.id === value?.id),
    [slots, value?.id]
  );

  const renderAnchor: React.FC<{
    item?: ISelectOption<DropzoneUserEssentialsFragment>;
    openMenu(): void;
  }> = React.useCallback(
    ({ item, openMenu }) => (
      <Chip {...{ backgroundColor, small, color, onPress: openMenu }} icon="shield-account">
        {truncate(item?.label || 'No LM', { length: 12 })}
      </Chip>
    ),
    [backgroundColor, color, small]
  );

  return !allowed ? (
    <Chip {...{ backgroundColor, small, color }} icon="shield-account">
      {value?.user?.name || 'No LM'}
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
