import { CertificationBodyEssentialsFragment } from 'app/api/operations';
import { useCertificationBodiesQuery } from 'app/api/reflection';
import * as React from 'react';
import CardSelect from './CardSelect';

interface ICertificationBodyCardSelect {
  value?: CertificationBodyEssentialsFragment | null;
  /** The bodies to choose from, for example the ones an operator accepts; every body when left out */
  bodies?: CertificationBodyEssentialsFragment[] | null;
  onSelect(jt: CertificationBodyEssentialsFragment): void;
}

export default function CertificationBodyCardSelect(props: ICertificationBodyCardSelect) {
  const { value, bodies, onSelect } = props;
  const { data } = useCertificationBodiesQuery({ skip: !!bodies });

  return (
    <CardSelect<CertificationBodyEssentialsFragment>
      autoSelectFirst
      items={bodies ?? data?.certificationBodies ?? []}
      selected={[value].filter(Boolean) as CertificationBodyEssentialsFragment[]}
      isSelected={(item) => item.id === value?.id}
      renderItemLabel={(certificationBody) => certificationBody?.name}
      onChangeSelected={([first]) => (first ? onSelect(first) : null)}
    />
  );
}
