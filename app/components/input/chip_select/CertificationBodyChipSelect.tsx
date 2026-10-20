import { CertificationBodyEssentialsFragment } from 'app/api/operations';
import { useCertificationBodiesQuery } from 'app/api/reflection';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Subheader } from 'app/ui';
import { withHookForm } from '../withHookForm';
import ChipSelect from './ChipSelect';

interface ICertificationBodyChipSelect {
  /** The bodies chosen */
  value?: CertificationBodyEssentialsFragment[] | null;
  /** Only the bodies of this industry (a template slug) are offered */
  industry?: string | null;
  error?: string | null;
  onChange(bodies: CertificationBodyEssentialsFragment[]): void;
}

/** Several certification bodies can be chosen: an operator accepts all of them */
function CertificationBodyChipSelect(props: ICertificationBodyChipSelect) {
  const { t } = useTranslation(['common', 'terms']);
  const { value, industry, onChange, error } = props;
  const { data } = useCertificationBodiesQuery();

  const items = React.useMemo(
    () =>
      (data?.certificationBodies ?? []).filter(
        (body) => !industry || !body.industry || body.industry === industry
      ),
    [data?.certificationBodies, industry]
  );
  const chosen = React.useMemo(() => value ?? [], [value]);

  return (
    <>
      <Subheader>{t('terms:certification_body', { count: 2 })}</Subheader>
      <ChipSelect<CertificationBodyEssentialsFragment>
        {...{ error }}
        allowEmpty
        autoSelectFirst={items.length === 1}
        items={items}
        value={chosen}
        renderItemLabel={(body) => body.name}
        onChange={onChange}
      />
    </>
  );
}

export const CertificationBodyChipSelectField = withHookForm(CertificationBodyChipSelect);

export default CertificationBodyChipSelect;
