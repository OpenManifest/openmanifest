import { FederationEssentialsFragment } from 'app/api/operations';
import { useFederationsQuery } from 'app/api/reflection';
import * as React from 'react';
import { List } from 'react-native-paper';
import Select from '../select/Select';
import { withHookForm } from '../withHookForm';

interface IFederationSelect {
  value?: FederationEssentialsFragment | null;
  onChange(jt: FederationEssentialsFragment): void;
}

function FederationSelect(props: IFederationSelect) {
  const { value, onChange } = props;

  const { data } = useFederationsQuery();

  React.useEffect(() => {
    if (data?.federations?.length === 1 && !value) {
      onChange(data.federations[0]);
    }
  }, [data?.federations, onChange, value]);

  const options = React.useMemo(
    () =>
      data?.federations?.map((node) => ({
        label: node?.name || '',
        value: node as FederationEssentialsFragment,
      })) || [],
    [data?.federations]
  );

  const selected = React.useMemo(
    () => options?.map((option) => option.value).find((node) => node?.id === value?.id),
    [options, value?.id]
  );

  return (
    <>
      <List.Subheader>Federation</List.Subheader>
      <Select<FederationEssentialsFragment>
        value={selected}
        options={options}
        onChange={onChange}
      />
    </>
  );
}

export const FederationSelectField = withHookForm(FederationSelect);

export default FederationSelect;
