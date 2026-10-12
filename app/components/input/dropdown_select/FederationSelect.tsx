import { FederationEssentialsFragment } from 'app/api/operations';
import { useFederationsQuery } from 'app/api/reflection';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Subheader } from 'app/ui';
import Select from '../select/Select';
import { withHookForm } from '../withHookForm';

interface IFederationSelect {
  value?: FederationEssentialsFragment | null;
  error?: string | null;
  onChange(jt: FederationEssentialsFragment): void;
}

function FederationSelect(props: IFederationSelect) {
  const { t } = useTranslation(['common', 'terms']);
  const { value, onChange, error } = props;

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
      <Subheader>{t('terms:certification_body', { count: 1 })}</Subheader>
      <Select<FederationEssentialsFragment>
        value={selected}
        options={options}
        onChange={onChange}
        error={error}
      />
    </>
  );
}

export const FederationSelectField = withHookForm(FederationSelect);

export default FederationSelect;
