import { PlaneEssentialsFragment } from 'app/api/operations';
import { truncate } from 'lodash';
import * as React from 'react';
import { useTheme } from 'react-native-paper';
import { usePlanesQuery } from '../../api/reflection';
import { Permission } from '../../api/schema.d';
import useRestriction from '../../hooks/useRestriction';
import { useAppSelector } from '../../state';
import Select, { ISelectOption } from '../input/select/Select';
import Chip from './Chip';

interface IPlaneChipSelect {
  value?: PlaneEssentialsFragment | null;
  small?: boolean;
  backgroundColor?: string;
  color?: string;

  onSelect(dzUser: PlaneEssentialsFragment): void;
}

export default function PlaneChip(props: IPlaneChipSelect) {
  const { small, color: assignedColor, backgroundColor, value, onSelect } = props;
  const theme = useTheme();
  const color = assignedColor || theme.colors.onSurface;
  const { currentDropzoneId } = useAppSelector((root) => root.global);

  const { data } = usePlanesQuery({
    variables: {
      dropzoneId: currentDropzoneId?.toString() as string,
    },
  });
  const allowed = useRestriction(Permission.UpdateLoad);

  const options = React.useMemo(
    () =>
      data?.planes?.map((node) => ({
        label: node?.name || '',
        value: node as PlaneEssentialsFragment,
      })) || [],
    [data?.planes]
  );

  const selected = React.useMemo(
    () => data?.planes?.find((node) => node?.id === value?.id),
    [data?.planes, value?.id]
  );

  const renderAnchor: React.FC<{
    item?: ISelectOption<PlaneEssentialsFragment>;
    openMenu(): void;
  }> = React.useCallback(
    ({ item, openMenu }) => (
      <Chip {...{ backgroundColor, small, color, onPress: openMenu }} icon="airplane">
        {truncate(item?.label || 'No Plane', { length: 12 })}
      </Chip>
    ),
    [backgroundColor, color, small]
  );

  return !allowed ? (
    <Chip {...{ backgroundColor, small, color }} icon="airplane">
      {value?.name || 'No Plane'}
    </Chip>
  ) : (
    <Select<PlaneEssentialsFragment>
      value={selected}
      options={options}
      renderAnchor={renderAnchor}
      onChange={onSelect}
    />
  );
}
