import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDropzoneUsersQuery } from 'app/api/reflection';
import * as React from 'react';
import { Chip, Menu, useTheme } from 'react-native-paper';
import { Permission } from '../../api/schema.d';
import useRestriction from '../../hooks/useRestriction';
import { useAppSelector } from '../../state';

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
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const { currentDropzoneId } = useAppSelector((root) => root.global);

  const { data } = useDropzoneUsersQuery({
    variables: {
      dropzoneId: Number(currentDropzoneId),
      permissions: [Permission.ActAsPilot],
    },
  });
  const allowed = useRestriction(Permission.UpdateLoad);

  return !allowed ? (
    <Chip
      mode="outlined"
      selectedColor={color}
      style={{
        padding: 8,
        marginHorizontal: 4,
        backgroundColor,
        height: small ? 25 : undefined,
        alignItems: 'center',
        borderColor: color || undefined,
      }}
      icon={(iconProps) => (
        <MaterialCommunityIcons
          name="shield-airplane"
          {...iconProps}
          style={{ marginTop: 0, marginBottom: 3 }}
        />
      )}
      textStyle={{ marginTop: 0, color, fontSize: small ? 12 : undefined }}
    >
      {value?.user?.name || 'No pilot'}
    </Chip>
  ) : (
    <Menu
      onDismiss={() => setMenuOpen(false)}
      visible={isMenuOpen}
      anchor={
        <Chip
          mode="outlined"
          icon={(iconProps) => (
            <MaterialCommunityIcons
              name="shield-airplane"
              {...iconProps}
              style={{ marginTop: 0, marginBottom: 3 }}
            />
          )}
          selectedColor={color}
          style={{
            backgroundColor,
            height: small ? 25 : undefined,
            alignItems: 'center',
            borderColor: color || undefined,
          }}
          textStyle={{
            marginTop: 0,
            alignSelf: 'center',
            color,
            fontSize: small ? 12 : undefined,
          }}
          onPress={() => setMenuOpen(true)}
        >
          {value?.id ? value?.user?.name : 'No pilot'}
        </Chip>
      }
    >
      {data?.dropzone?.dropzoneUsers?.edges?.map((edge) => (
        <Menu.Item
          key={`pilot-select-${edge?.node?.id}`}
          onPress={() => {
            setMenuOpen(false);
            if (edge?.node) {
              onSelect(edge.node);
            }
          }}
          icon={edge?.node?.user?.image ? { uri: edge?.node?.user?.image } : 'account'}
          title={edge?.node?.user?.name}
        />
      ))}
    </Menu>
  );
}
