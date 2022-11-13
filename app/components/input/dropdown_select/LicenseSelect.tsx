import { LicenseEssentialsFragment } from 'app/api/operations';
import { useLicensesQuery } from 'app/api/reflection';
import * as React from 'react';
import Select from '../select/Select';
import { withHookForm } from '../withHookForm';

interface ILicenseSelect {
  value?: LicenseEssentialsFragment | null;
  federationId?: number | null;
  onChange(jt: LicenseEssentialsFragment): void;
}

function LicenseSelect(props: ILicenseSelect) {
  const { onChange, value, federationId } = props;

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
      onChange={onChange}
    />
  );
}

export const LicenseSelectField = withHookForm(LicenseSelect);

export default LicenseSelect;
