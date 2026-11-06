import { CertificationLevelEssentialsFragment } from 'app/api/operations';
import { useCertificationLevelsQuery } from 'app/api/reflection';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Subheader } from 'app/ui';
import { withHookForm } from '../withHookForm';
import ChipSelect from './ChipSelect';

interface ICertificationLevelSelect {
  value?: CertificationLevelEssentialsFragment | null;
  certificationBodyId?: number | null;
  error?: string | null;
  onChange(jt: CertificationLevelEssentialsFragment): void;
}

function CertificationLevelChipSelect(props: ICertificationLevelSelect) {
  const { t } = useTranslation(['common', 'terms']);
  const { certificationBodyId, onChange, value, error } = props;
  const { data } = useCertificationLevelsQuery({
    variables: {
      certificationBodyId,
    },
  });
  return (
    <>
      <Subheader>{t('terms:certification', { count: 1 })}</Subheader>
      <ChipSelect<CertificationLevelEssentialsFragment>
        {...{ error }}
        autoSelectFirst
        icon="ticket-account"
        items={data?.certificationLevels || []}
        value={[value].filter(Boolean) as CertificationLevelEssentialsFragment[]}
        isSelected={(item) => item.id === value?.id}
        renderItemLabel={(certificationLevel) => certificationLevel?.name}
        isDisabled={() => false}
        onChange={([first]) => (first ? onChange(first) : null)}
      />
    </>
  );
}

export const CertificationLevelChipSelectField = withHookForm(CertificationLevelChipSelect);

export default CertificationLevelChipSelect;
