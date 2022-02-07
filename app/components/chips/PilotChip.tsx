import { useDropzoneUsersQuery } from 'app/api/reflection';
import * as React from 'react';
import { Menu, useTheme } from 'react-native-paper';
import { Permission } from '../../api/schema.d';
import useRestriction from '../../hooks/useRestriction';
import { useAppSelector } from '../../state';
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
    <Chip {...{ backgroundColor, small, color }} icon="shield-airplane">
      {value?.user?.name || 'No pilot'}
    </Chip>
  ) : (
    <Menu
      onDismiss={() => setMenuOpen(false)}
      visible={isMenuOpen}
      anchor={
        <Chip
          {...{ backgroundColor, small, color }}
          icon="shield-airplane"
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
