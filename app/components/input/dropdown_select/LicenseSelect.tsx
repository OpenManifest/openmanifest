import { LicenseEssentialsFragment } from 'app/api/operations';
import { useLicensesQuery } from 'app/api/reflection';
import * as React from 'react';
import { List, Menu } from 'react-native-paper';

interface ILicenseSelect {
  value?: LicenseEssentialsFragment | null;
  required?: boolean;
  federationId?: number | null;
  onSelect(jt: LicenseEssentialsFragment): void;
}

export default function LicenseSelect(props: ILicenseSelect) {
  const { onSelect, value, required, federationId } = props;
  const [isMenuOpen, setMenuOpen] = React.useState(false);

  const { data } = useLicensesQuery({
    variables: {
      federationId,
    },
  });
  return (
    <>
      <List.Subheader>License</List.Subheader>
      <Menu
        onDismiss={() => setMenuOpen(false)}
        visible={isMenuOpen}
        anchor={
          <List.Item
            onPress={() => {
              setMenuOpen(true);
            }}
            title={value?.name || 'Please select a license'}
            description={!required ? 'Optional' : null}
          />
        }
      >
        {data?.licenses?.map((license) => (
          <Menu.Item
            key={`license-select-${license.id}`}
            onPress={() => {
              setMenuOpen(false);
              onSelect(license);
            }}
            title={license.name || '-'}
          />
        ))}
      </Menu>
    </>
  );
}
