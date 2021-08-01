import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { List, Menu } from 'react-native-paper';
import { License, Query } from '../../../api/schema.d';

interface ILicenseSelect {
  value?: License | null;
  required?: boolean;
  federationId?: number | null;
  onSelect(jt: License): void;
}

const QUERY_LICENSES = gql`
  query Licenses($federationId: Int) {
    licenses(federationId: $federationId) {
      id
      name

      federation {
        id
        name
      }
    }
  }
`;

export default function LicenseSelect(props: ILicenseSelect) {
  const { onSelect, value, required, federationId } = props;
  const [isMenuOpen, setMenuOpen] = React.useState(false);

  const { data } = useQuery<Query>(QUERY_LICENSES, {
    variables: {
      federationId,
    },
  });
  return (
    <>
      <List.Subheader>License</List.Subheader>
      <Menu
        onDismiss={() => setMenuOpen(false)}
        visible={isMenuOpen}
        anchor={
          <List.Item
            onPress={() => {
              setMenuOpen(true);
            }}
            title={value?.name || 'Please select a license'}
            description={!required ? 'Optional' : null}
          />
        }
      >
        {data?.licenses?.map((license) => (
          <Menu.Item
            key={`license-select-${license.id}`}
            onPress={() => {
              setMenuOpen(false);
              onSelect(license);
            }}
            title={license.name || '-'}
          />
        ))}
      </Menu>
    </>
  );
}
