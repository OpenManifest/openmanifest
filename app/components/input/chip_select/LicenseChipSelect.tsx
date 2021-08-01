import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { List } from 'react-native-paper';
import { License, Query } from '../../../api/schema.d';
import ChipSelect from './ChipSelect';

interface ILicenseSelect {
  value?: License | null;
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

export default function LicenseChipSelect(props: ILicenseSelect) {
  const { federationId, onSelect, value } = props;
  const { data } = useQuery<Query>(QUERY_LICENSES, {
    variables: {
      federationId,
    },
  });
  return (
    <>
      <List.Subheader>License</List.Subheader>
      <ChipSelect<License>
        autoSelectFirst
        icon="ticket-account"
        items={data?.licenses || []}
        selected={[value].filter(Boolean) as License[]}
        isSelected={(item) => item.id === value?.id}
        renderItemLabel={(license) => license?.name}
        isDisabled={() => false}
        onChangeSelected={([first]) => (first ? onSelect(first) : null)}
      />
    </>
  );
}
