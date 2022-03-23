import { LicenseEssentialsFragment } from 'app/api/operations';
import { useLicensesQuery } from 'app/api/reflection';
import * as React from 'react';
import Select from '../select/Select';

interface ILicenseSelect {
  value?: LicenseEssentialsFragment | null;
  federationId?: number | null;
  onSelect(jt: LicenseEssentialsFragment): void;
}

export default function LicenseSelect(props: ILicenseSelect) {
  const { onSelect, value, federationId } = props;

  const { data } = useLicensesQuery({
    variables: {
      federationId,
    },
  });

  const options = React.useMemo(
    () =>
      data?.licenses.map((node) => ({
        label: node?.name || '',
        value: node as LicenseEssentialsFragment,
      })) || [],
    [data?.licenses]
  );

  const selected = React.useMemo(() => value, [value]);
  return (
    <Select<LicenseEssentialsFragment>
      label="License"
      value={selected}
      options={options}
      onChange={onSelect}
    />
  );
}
