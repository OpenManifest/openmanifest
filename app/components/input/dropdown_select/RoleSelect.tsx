import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { List, Menu } from 'react-native-paper';
import { Query, UserRole } from '../../../api/schema.d';
import { useAppSelector } from '../../../state';

interface IRoleSelect {
  value?: UserRole | null;
  required?: boolean;
  disabled?: boolean;
  onSelect(jt: UserRole): void;
}

const QUERY_ROLES = gql`
  query RolesQuery($dropzoneId: Int!) {
    dropzone(id: $dropzoneId) {
      id
      roles(selectable: true) {
        id
        name
      }
    }
  }
`;

export default function RoleSelect(props: IRoleSelect) {
  const { onSelect, disabled, required, value } = props;
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const { currentDropzoneId } = useAppSelector((root) => root.global);
  const { data } = useQuery<Query>(QUERY_ROLES, {
    variables: {
      dropzoneId: Number(currentDropzoneId),
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
