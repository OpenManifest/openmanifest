import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { List, Menu } from 'react-native-paper';
import { JumpType, Query } from '../../../api/schema.d';

interface IJumpTypeSelect {
  value?: JumpType | null;
  required?: boolean;
  userId?: number | null;
  onSelect(jt: JumpType): void;
}

const QUERY_JUMP_TYPES = gql`
  query JumpTypes($allowedForUserId: Int) {
    jumpTypes(allowedForUserId: $allowedForUserId) {
      id
      name
    }
  }
`;

export default function JumpTypeSelect(props: IJumpTypeSelect) {
  const { userId, onSelect, value, required } = props;
  const [isMenuOpen, setMenuOpen] = React.useState(false);

  const { data } = useQuery<Query>(QUERY_JUMP_TYPES, {
    variables: {
      allowedForUserId: userId,
    },
  });
  return (
    <>
      <List.Subheader>Jump type</List.Subheader>
      <Menu
        onDismiss={() => setMenuOpen(false)}
        visible={isMenuOpen}
        anchor={
          <List.Item
            onPress={() => {
              setMenuOpen(true);
            }}
            title={value?.name || 'Please select jump type'}
            description={!required ? 'Optional' : null}
          />
        }
      >
        {data?.jumpTypes?.map((jumpType) => (
          <Menu.Item
            onPress={() => {
              setMenuOpen(false);
              onSelect(jumpType);
            }}
            title={jumpType.name || '-'}
          />
        ))}
      </Menu>
    </>
  );
}
