import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { Chip, Menu, useTheme } from 'react-native-paper';
import { Query, DropzoneUser, Permission } from '../../api/schema.d';
import useRestriction from '../../hooks/useRestriction';
import { useAppSelector } from '../../state';

interface IGCAChipSelect {
  value?: DropzoneUser | null;
  small?: boolean;
  backgroundColor?: string;
  color?: string;

  onSelect(user: DropzoneUser): void;
}

export const QUERY_PERMISSION_USER = gql`
  query QueryGCAUsers($dropzoneId: Int!, $permissions: [Permission!]) {
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

export default function GCAChip(props: IGCAChipSelect) {
  const { small, color: assignedColor, backgroundColor, onSelect, value } = props;
  const theme = useTheme();
  const color = assignedColor || theme.colors.onSurface;
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const { currentDropzoneId } = useAppSelector((root) => root.global);

  const { data } = useQuery<Query>(QUERY_PERMISSION_USER, {
    variables: {
      dropzoneId: Number(currentDropzoneId),
      permissions: ['actAsGCA'],
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
      {value?.user?.name || 'No gca'}
    </Chip>
  ) : (
    <Menu
      onDismiss={() => setMenuOpen(false)}
      visible={isMenuOpen}
      anchor={
        <Chip
          mode="outlined"
          icon="radio-handheld"
          selectedColor={color}
          onPress={() => setMenuOpen(true)}
          style={{
            marginHorizontal: 4,
            backgroundColor,
            height: small ? 25 : undefined,
            alignItems: 'center',
            borderColor: color || undefined,
          }}
          textStyle={{ color, fontSize: small ? 12 : undefined }}
        >
          {value?.id ? value?.user?.name : 'No gca'}
        </Chip>
      }
    >
      {data?.dropzone?.dropzoneUsers?.edges?.map((edge) => (
        <Menu.Item
          key={`gca-chip-${edge?.node?.id}`}
          onPress={() => {
            setMenuOpen(false);
            if (edge?.node) {
              onSelect(edge?.node);
            }
          }}
          title={edge?.node?.user?.name}
        />
      ))}
    </Menu>
  );
}
