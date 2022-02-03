import { SlotDetailsFragment } from 'app/api/operations';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Chip, Menu, useTheme, Text } from 'react-native-paper';
import { Permission } from '../../api/schema.d';
import useRestriction from '../../hooks/useRestriction';
import UserAvatar from '../UserAvatar';

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
          titleStyle={styles.menuItemTitle}
          title={
            <>
              <UserAvatar
                name={slot?.dropzoneUser?.user?.name || ''}
                image={slot?.dropzoneUser?.user?.image || undefined}
                size={24}
              />
              <Text>{slot?.dropzoneUser?.user?.name}</Text>
            </>
          }
        />
      ))}
    </Menu>
  );
}

const styles = StyleSheet.create({
  menuItemTitle: {
    display: 'flex',
    alignItems: 'center',
  },
});
