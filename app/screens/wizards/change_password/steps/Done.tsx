import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, Stack, Text } from 'app/ui';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard/Step';

function DoneStep(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  return (
    <Step {...props} title={t('auth.change.doneTitle')}>
      <Fields>
        <Stack gap="md" align="center">
          <Icon name="check-circle-outline" size={56} tone="ok" />
          <Text align="center">{t('auth.change.doneBody')}</Text>
        </Stack>
      </Fields>
    </Step>
  );
}

export default DoneStep;
