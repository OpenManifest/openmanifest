import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from 'app/ui';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard/Step';

function DoneStep(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  return (
    <Step {...props} title={t('auth.recover.doneTitle')}>
      <Fields>
        <Text>{t('auth.recover.doneBody')}</Text>
      </Fields>
    </Step>
  );
}

export default DoneStep;
