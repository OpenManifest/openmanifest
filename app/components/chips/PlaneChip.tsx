import { PlaneEssentialsFragment } from 'app/api/operations';
import * as React from 'react';
import { Chip, Menu, useTheme } from 'react-native-paper';
import { usePlanesQuery } from '../../api/reflection';
import { Permission } from '../../api/schema.d';
import useRestriction from '../../hooks/useRestriction';
import { useAppSelector } from '../../state';

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
    <Chip
      mode="outlined"
      icon="airplane-takeoff"
      selectedColor={color}
      style={{
        marginHorizontal: 4,
        backgroundColor,
        height: small ? 25 : undefined,
        alignItems: 'center',
      }}
      textStyle={{
        color,
        fontSize: small ? 12 : undefined,
      }}
    >
      {value?.name || 'No plane'}
    </Chip>
  ) : (
    <Menu
      onDismiss={() => setMenuOpen(false)}
      visible={isMenuOpen}
      anchor={
        <Chip
          mode="outlined"
          icon="airplane"
          selectedColor={color}
          style={{
            marginHorizontal: 4,
            backgroundColor,
            height: small ? 25 : undefined,
            alignItems: 'center',
            borderColor: color || undefined,
          }}
          textStyle={{ color, fontSize: small ? 12 : undefined }}
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
