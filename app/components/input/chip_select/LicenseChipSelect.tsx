import { LicenseEssentialsFragment } from 'app/api/operations';
import { useLicensesQuery } from 'app/api/reflection';
import * as React from 'react';
import { List } from 'react-native-paper';
import { withHookForm } from '../withHookForm';
import ChipSelect from './ChipSelect';

interface ILicenseSelect {
  value?: LicenseEssentialsFragment | null;
  federationId?: number | null;
  error?: string | null;
  onChange(jt: LicenseEssentialsFragment): void;
}

function LicenseChipSelect(props: ILicenseSelect) {
  const { federationId, onChange, value, error } = props;
  const { data } = useLicensesQuery({
    variables: {
      federationId,
    },
  });
  return (
    <>
      <List.Subheader>License</List.Subheader>
      <ChipSelect<LicenseEssentialsFragment>
        {...{ error }}
        autoSelectFirst
        icon="ticket-account"
        items={data?.licenses || []}
        value={[value].filter(Boolean) as LicenseEssentialsFragment[]}
        isSelected={(item) => item.id === value?.id}
        renderItemLabel={(license) => license?.name}
        isDisabled={() => false}
        onChange={([first]) => (first ? onChange(first) : null)}
      />
    </>
  );
}

export const LicenseChipSelectField = withHookForm(LicenseChipSelect);

export default LicenseChipSelect;
