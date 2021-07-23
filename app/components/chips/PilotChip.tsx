import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { Chip, Menu } from 'react-native-paper';
import { Query, DropzoneUser, Permission } from '../../api/schema.d';
import useRestriction from '../../hooks/useRestriction';
import { useAppSelector } from '../../state';

interface IPilotChipSelect {
  small?: boolean;
  backgroundColor?: string;
  color?: string;
  value?: DropzoneUser | null;
  onSelect(user: DropzoneUser): void;
}

const QUERY_DROPZONE_USERS = gql`
  query QueryPilotUsers($dropzoneId: Int!, $permissions: [Permission!]) {
    dropzone(id: $dropzoneId) {
      id
      name

      dropzoneUsers(permissions: $permissions) {
        edges {
          node {
            id
            role {
              id
              name
            }
            user {
              id
              name
            }
          }
        }
      }
    }
  }
`;

export default function PilotChip(props: IPilotChipSelect) {
  const { small, color, backgroundColor, onSelect, value } = props;
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const { currentDropzoneId } = useAppSelector((root) => root.global);

  const { data } = useQuery<Query>(QUERY_DROPZONE_USERS, {
    variables: {
      dropzoneId: currentDropzoneId,
      permissions: ['actAsPilot'],
    },
  });
  const allowed = useRestriction(Permission.UpdateLoad);

  return !allowed ? (
    <Chip
      mode="outlined"
      icon="radio-handheld"
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
      {value?.user?.name || 'No pilot'}
    </Chip>
  ) : (
    <Menu
      onDismiss={() => setMenuOpen(false)}
      visible={isMenuOpen}
      anchor={
        <Chip
          mode="outlined"
          icon="shield-airplane"
          selectedColor={color}
          style={{
            marginHorizontal: 4,
            backgroundColor,
            height: small ? 25 : undefined,
            alignItems: 'center',
            borderColor: color || undefined,
          }}
          textStyle={{ color, fontSize: small ? 12 : undefined }}
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
          title={edge?.node?.user?.name}
        />
      ))}
    </Menu>
  );
}
