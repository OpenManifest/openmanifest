import {
  CertificationLevelDetailsFragment,
  CertificationLevelEssentialsFragment,
} from 'app/api/operations';
import { useCertificationLevelsQuery } from 'app/api/reflection';
import * as React from 'react';
import CardSelect from './CardSelect';

interface ICertificationLevelSelect {
  value?: CertificationLevelEssentialsFragment | null;
  certificationBodyId?: number | null;
  onSelect(jt: CertificationLevelDetailsFragment): void;
}

export default function CertificationLevelCardSelect(props: ICertificationLevelSelect) {
  const { certificationBodyId, onSelect, value } = props;
  const { data } = useCertificationLevelsQuery({
    variables: {
      certificationBodyId,
    },
  });
  return (
    <CardSelect<CertificationLevelDetailsFragment>
      autoSelectFirst
      items={data?.certificationLevels || []}
      selected={[value].filter(Boolean) as CertificationLevelDetailsFragment[]}
      isSelected={(item) => item.id === value?.id}
      renderItemLabel={(certificationLevel) => certificationLevel?.name}
      onChangeSelected={([first]) => (first ? onSelect(first) : null)}
    />
  );
}
