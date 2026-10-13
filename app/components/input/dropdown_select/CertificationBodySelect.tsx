import { CertificationBodyEssentialsFragment } from 'app/api/operations';
import { useCertificationBodiesQuery } from 'app/api/reflection';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Subheader } from 'app/ui';
import Select from '../select/Select';
import { withHookForm } from '../withHookForm';

interface ICertificationBodySelect {
  value?: CertificationBodyEssentialsFragment | null;
  error?: string | null;
  onChange(jt: CertificationBodyEssentialsFragment): void;
}

function CertificationBodySelect(props: ICertificationBodySelect) {
  const { t } = useTranslation(['common', 'terms']);
  const { value, onChange, error } = props;

  const { data } = useCertificationBodiesQuery();

  React.useEffect(() => {
    if (data?.certificationBodies?.length === 1 && !value) {
      onChange(data.certificationBodies[0]);
    }
  }, [data?.certificationBodies, onChange, value]);

  const options = React.useMemo(
    () =>
      data?.certificationBodies?.map((node) => ({
        label: node?.name || '',
        value: node as CertificationBodyEssentialsFragment,
      })) || [],
    [data?.certificationBodies]
  );

  const selected = React.useMemo(
    () => options?.map((option) => option.value).find((node) => node?.id === value?.id),
    [options, value?.id]
  );

  return (
    <>
      <Subheader>{t('terms:certification_body', { count: 1 })}</Subheader>
      <Select<CertificationBodyEssentialsFragment>
        value={selected}
        options={options}
        onChange={onChange}
        error={error}
      />
    </>
  );
}

export const CertificationBodySelectField = withHookForm(CertificationBodySelect);

export default CertificationBodySelect;
