import { PlaneEssentialsFragment } from 'app/api/operations';
import * as React from 'react';
import { Menu, useTheme } from 'react-native-paper';
import { usePlanesQuery } from '../../api/reflection';
import { Permission } from '../../api/schema.d';
import useRestriction from '../../hooks/useRestriction';
import { useAppSelector } from '../../state';
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
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const { currentDropzoneId } = useAppSelector((root) => root.global);

  const { data } = usePlanesQuery({
    variables: {
      dropzoneId: Number(currentDropzoneId),
    },
  });
  const allowed = useRestriction(Permission.UpdateLoad);

  return !allowed ? (
    <Chip {...{ backgroundColor, small, color }} icon="airplane-takeoff">
      {value?.name || 'No plane'}
    </Chip>
  ) : (
    <Menu
      onDismiss={() => setMenuOpen(false)}
      visible={isMenuOpen}
      anchor={
        <Chip
          {...{ backgroundColor, small, color }}
          icon="airplane-takeoff"
          onPress={() => allowed && setMenuOpen(true)}
        >
          {value?.name || 'No plane'}
        </Chip>
      }
    >
      {data?.planes?.map((plane) => (
        <Menu.Item
          key={`lm-plane-chip-${plane.id}`}
          onPress={() => {
            setMenuOpen(false);
            onSelect(plane);
          }}
          title={plane.name}
        />
      ))}
    </Menu>
  );
}
