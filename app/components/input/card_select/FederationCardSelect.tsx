import { FederationEssentialsFragment } from 'app/api/operations';
import { useFederationsQuery } from 'app/api/reflection';
import * as React from 'react';
import CardSelect from './CardSelect';

interface IFederationCardSelect {
  value?: FederationEssentialsFragment | null;
  onSelect(jt: FederationEssentialsFragment): void;
}

export default function FederationCardSelect(props: IFederationCardSelect) {
  const { value, onSelect } = props;
  const { data } = useFederationsQuery();

  return (
    <CardSelect<FederationEssentialsFragment>
      autoSelectFirst
      items={data?.federations || []}
      selected={[value].filter(Boolean) as FederationEssentialsFragment[]}
      isSelected={(item) => item.id === value?.id}
      renderItemLabel={(federation) => federation?.name}
      onChangeSelected={([first]) => (first ? onSelect(first) : null)}
    />
  );
}
