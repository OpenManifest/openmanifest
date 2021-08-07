import * as React from 'react';
import { Chip, Menu, useTheme } from 'react-native-paper';
import { Slot, DropzoneUser, Permission } from '../../api/schema.d';
import useRestriction from '../../hooks/useRestriction';

interface ILoadMasterChipSelect {
  value?: DropzoneUser | null;
  small?: boolean;
  backgroundColor?: string;
  color?: string;

  slots: Slot[];
  onSelect(user: DropzoneUser): void;
}

export default function LoadMasterChip(props: ILoadMasterChipSelect) {
  const { small, color: assignedColor, backgroundColor, value, onSelect, slots } = props;
  const theme = useTheme();
  const color = assignedColor || theme.colors.onSurface;
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const allowed = useRestriction(Permission.UpdateLoad);

  return !allowed ? (
    <Chip
      mode="outlined"
      icon="shield-account"
      selectedColor={color}
      style={{
        marginHorizontal: 4,
        backgroundColor,
        height: small ? 25 : undefined,
        alignItems: 'center',
        borderColor: color || undefined,
      }}
      textStyle={{ color, fontSize: small ? 12 : undefined }}
    >
      {value?.user?.name || 'No loadmaster'}
    </Chip>
  ) : (
    <Menu
      onDismiss={() => setMenuOpen(false)}
      visible={isMenuOpen}
      anchor={
        <Chip
          mode="outlined"
          icon="shield-account"
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
          {value?.id ? value?.user?.name : 'No loadmaster'}
        </Chip>
      }
    >
      {slots?.map((slot) => (
        <Menu.Item
          key={`lm-chip-${slot.id}`}
          onPress={() => {
            setMenuOpen(false);
            if (slot?.dropzoneUser) {
              onSelect(slot.dropzoneUser);
            }
          }}
          title={slot?.dropzoneUser?.user?.name}
        />
      ))}
    </Menu>
  );
}
