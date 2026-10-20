import * as React from 'react';
import { Text } from 'app/ui';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard/Step';
import { useTranslation } from 'react-i18next';

function DoneStep(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  return (
    <Step {...props} title={t('forms.sign_up.checkYourEmail')}>
      <Fields>
        <Text>{t('forms.sign_up.confirmEmail')}</Text>
      </Fields>
    </Step>
  );
}

export default DoneStep;
