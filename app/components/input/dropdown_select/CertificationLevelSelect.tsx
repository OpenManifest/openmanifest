import { CertificationLevelEssentialsFragment } from 'app/api/operations';
import { useTranslation } from 'react-i18next';
import { useCertificationLevelsQuery } from 'app/api/reflection';
import * as React from 'react';
import Select from '../select/Select';
import { withHookForm } from '../withHookForm';

interface ICertificationLevelSelect {
  value?: CertificationLevelEssentialsFragment | null;
  certificationBodyId?: number | null;
  onChange(jt: CertificationLevelEssentialsFragment): void;
}

function CertificationLevelSelect(props: ICertificationLevelSelect) {
  const { onChange, value, certificationBodyId } = props;
  const { t } = useTranslation('terms');

  const { data } = useCertificationLevelsQuery({
    variables: {
      certificationBodyId,
    },
  });

  const options = React.useMemo(
    () =>
      data?.certificationLevels.map((node) => ({
        label: node?.name || '',
        value: node as CertificationLevelEssentialsFragment,
      })) || [],
    [data?.certificationLevels]
  );

  const selected = React.useMemo(() => value, [value]);
  return (
    <Select<CertificationLevelEssentialsFragment>
      label={t('certification', { count: 1 })}
      value={selected}
      options={options}
      onChange={onChange}
    />
  );
}

export const CertificationLevelSelectField = withHookForm(CertificationLevelSelect);

export default CertificationLevelSelect;
