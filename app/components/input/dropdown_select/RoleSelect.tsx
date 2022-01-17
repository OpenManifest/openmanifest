import { RoleEssentialsFragment } from 'app/api/operations';
import { useRolesQuery } from 'app/api/reflection';
import * as React from 'react';
import { List, Menu } from 'react-native-paper';
import { useAppSelector } from '../../../state';

interface IRoleSelect {
  value?: RoleEssentialsFragment | null;
  required?: boolean;
  disabled?: boolean;
  onSelect(jt: RoleEssentialsFragment): void;
}

export default function RoleSelect(props: IRoleSelect) {
  const { onSelect, disabled, required, value } = props;
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const { currentDropzoneId } = useAppSelector((root) => root.global);
  const { data } = useRolesQuery({
    variables: {
      dropzoneId: Number(currentDropzoneId),
      selectable: true,
    },
  });
  return (
    <>
      <List.Subheader style={{ paddingLeft: 0 }}>Access level</List.Subheader>
      <Menu
        onDismiss={() => setMenuOpen(false)}
        visible={!disabled && isMenuOpen}
        anchor={
          <List.Item
            left={() => <List.Icon icon="lock" />}
            onPress={
              disabled
                ? undefined
                : () => {
                    setMenuOpen(true);
                  }
            }
            title={value?.name?.replace('_', ' ')?.toUpperCase() || 'Access level'}
            description={!required ? 'Optional' : null}
          />
        }
      >
        {data?.dropzone?.roles?.map((role) => (
          <Menu.Item
            onPress={() => {
              setMenuOpen(false);
              onSelect(role);
            }}
            title={role.name?.replace('_', ' ').toUpperCase() || '-'}
          />
        ))}
      </Menu>
    </>
  );
}
