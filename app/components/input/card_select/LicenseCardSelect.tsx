import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { License, Query } from '../../../api/schema.d';
import CardSelect from './CardSelect';

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

export default function LicenseCardSelect(props: ILicenseSelect) {
  const { federationId, onSelect, value } = props;
  const { data } = useQuery<Query>(QUERY_LICENSES, {
    variables: {
      federationId,
    },
  });
  return (
    <CardSelect<License>
      autoSelectFirst
      items={data?.licenses || []}
      selected={[value].filter(Boolean) as License[]}
      isSelected={(item) => item.id === value?.id}
      renderItemLabel={(license) => license?.name}
      onChangeSelected={([first]) => (first ? onSelect(first) : null)}
    />
  );
}
