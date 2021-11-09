import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { Federation, Query } from '../../../api/schema.d';
import CardSelect from './CardSelect';

interface IFederationCardSelect {
  value?: Federation | null;
  onSelect(jt: Federation): void;
}

const QUERY_FEDERATIONS = gql`
  query Federations {
    federations {
      id
      name
    }
  }
`;

export default function FederationCardSelect(props: IFederationCardSelect) {
  const { value, onSelect } = props;
  const { data } = useQuery<Query>(QUERY_FEDERATIONS);

  return (
    <CardSelect<Federation>
      autoSelectFirst
      items={data?.federations || []}
      selected={[value].filter(Boolean) as Federation[]}
      isSelected={(item) => item.id === value?.id}
      renderItemLabel={(federation) => federation?.name}
      onChangeSelected={([first]) => (first ? onSelect(first) : null)}
    />
  );
}
