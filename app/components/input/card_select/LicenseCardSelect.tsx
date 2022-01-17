import { LicenseDetailsFragment, LicenseEssentialsFragment } from 'app/api/operations';
import { useLicensesQuery } from 'app/api/reflection';
import * as React from 'react';
import CardSelect from './CardSelect';

interface ILicenseSelect {
  value?: LicenseEssentialsFragment | null;
  federationId?: number | null;
  onSelect(jt: LicenseDetailsFragment): void;
}

export default function LicenseCardSelect(props: ILicenseSelect) {
  const { federationId, onSelect, value } = props;
  const { data } = useLicensesQuery({
    variables: {
      federationId,
    },
  });
  return (
    <CardSelect<LicenseDetailsFragment>
      autoSelectFirst
      items={data?.licenses || []}
      selected={[value].filter(Boolean) as LicenseDetailsFragment[]}
      isSelected={(item) => item.id === value?.id}
      renderItemLabel={(license) => license?.name}
      onChangeSelected={([first]) => (first ? onSelect(first) : null)}
    />
  );
}
