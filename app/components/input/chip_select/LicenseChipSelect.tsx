import { LicenseEssentialsFragment } from 'app/api/operations';
import { useLicensesQuery } from 'app/api/reflection';
import * as React from 'react';
import { List } from 'react-native-paper';
import ChipSelect from './ChipSelect';

interface ILicenseSelect {
  value?: LicenseEssentialsFragment | null;
  federationId?: number | null;
  onSelect(jt: LicenseEssentialsFragment): void;
}

export default function LicenseChipSelect(props: ILicenseSelect) {
  const { federationId, onSelect, value } = props;
  const { data } = useLicensesQuery({
    variables: {
      federationId,
    },
  });
  return (
    <>
      <List.Subheader>License</List.Subheader>
      <ChipSelect<LicenseEssentialsFragment>
        autoSelectFirst
        icon="ticket-account"
        items={data?.licenses || []}
        selected={[value].filter(Boolean) as LicenseEssentialsFragment[]}
        isSelected={(item) => item.id === value?.id}
        renderItemLabel={(license) => license?.name}
        isDisabled={() => false}
        onChangeSelected={([first]) => (first ? onSelect(first) : null)}
      />
    </>
  );
}
