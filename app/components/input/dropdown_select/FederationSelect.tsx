import { FederationEssentialsFragment } from 'app/api/operations';
import { useFederationsQuery } from 'app/api/reflection';
import * as React from 'react';
import { List } from 'react-native-paper';
import Select from '../select/Select';

interface IFederationSelect {
  value?: FederationEssentialsFragment | null;
  onSelect(jt: FederationEssentialsFragment): void;
}

export default function FederationSelect(props: IFederationSelect) {
  const { value, onSelect } = props;

  const { data } = useFederationsQuery();

  React.useEffect(() => {
    if (data?.federations?.length === 1 && !value) {
      onSelect(data.federations[0]);
    }
  }, [data?.federations, onSelect, value]);

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
        onChange={onSelect}
      />
    </>
  );
}
