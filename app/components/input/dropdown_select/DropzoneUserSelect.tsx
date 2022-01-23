import { useDropzoneUsersQuery } from 'app/api/reflection';
import * as React from 'react';
import { List, Menu, Title } from 'react-native-paper';
import { DropzoneUser, Permission } from '../../../api/schema.d';
import { useAppSelector } from '../../../state';

interface IDropzoneUserSelect {
  requiredPermissions: Permission[];
  value: DropzoneUser | null;
  required?: boolean;
  label: string;
  onSelect(dzUser: DropzoneUser): void;
}

export default function DropzoneUserSelect(props: IDropzoneUserSelect) {
  const { requiredPermissions, value, onSelect, label, required } = props;
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const globalState = useAppSelector((root) => root.global);

  const { data, refetch } = useDropzoneUsersQuery({
    variables: {
      dropzoneId: globalState.currentDropzoneId as number,
      permissions: requiredPermissions,
    },
  });

  return (
    <>
      <Title>{label}</Title>
      <Menu
        onDismiss={() => setMenuOpen(false)}
        visible={isMenuOpen}
        anchor={
          <List.Item
            onPress={() => {
              if (!data?.dropzone?.dropzoneUsers?.edges?.length) {
                refetch();
              }
              setMenuOpen(true);
            }}
            title={value?.user?.id ? value?.user.name : 'No user selected'}
            style={{ width: '100%' }}
            right={() => <List.Icon icon="account" />}
            description={!required ? 'Optional' : null}
          />
        }
      >
        {data?.dropzone?.dropzoneUsers?.edges?.map((edge) => (
          <Menu.Item
            key={`user-select-${edge?.node?.id}`}
            style={{ width: '100%' }}
            onPress={() => {
              setMenuOpen(false);
              onSelect(edge?.node as DropzoneUser);
            }}
            title={edge?.node?.user?.name || '-'}
          />
        ))}
      </Menu>
    </>
  );
}
