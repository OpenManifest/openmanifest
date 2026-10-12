import * as React from 'react';
import Wizard from 'app/components/carousel_wizard/HookFormWizard';
import { IWizardStepDefinition, WizardRef } from 'app/components/carousel_wizard/Wizard';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useNotifications } from 'app/providers/notifications';
import CertificationBodyStep from './steps/CertificationBody';
import CertificationBodyNumberStep from './steps/CertificationBodyNumber';
import RealNameStep from './steps/RealName';
import NicknameStep from './steps/Nickname';
import CertificationLevelStep from './steps/CertificationLevel';
import QualificationsStep, { useQualificationStepRequired } from './steps/Qualifications';
import RigStep from './steps/Rig';
import ReserveRepackStep from './steps/ReserveRepack';
import AskForRigStep from './steps/AskForRig';
import WingloadingStep from './steps/Wingloading';
import DoneStep from './steps/Done';
import AvatarStep from './steps/Avatar';
import { useUserWizardForm } from './useForm';
import { UserProfileProvider, useUserProfileContext } from 'app/api/crud';
import { useOperatorContext } from 'app/providers';
import { FormProvider, useWatch } from 'react-hook-form';
import i18n from 'app/i18n';

const stepsBeforeQualifications = [
  RealNameStep,
  NicknameStep,
  AvatarStep,
  CertificationBodyStep,
  CertificationBodyNumberStep,
  CertificationLevelStep,
];
const stepsAfterQualifications = [
  AskForRigStep,
  RigStep,
  ReserveRepackStep,
  WingloadingStep,
  DoneStep,
];
export function UserWizard() {
  const wizard = React.useRef<WizardRef>(null);
  const withQualifications = useQualificationStepRequired();
  const steps = React.useMemo(
    () => [
      ...stepsBeforeQualifications,
      ...(withQualifications ? [QualificationsStep] : []),
      ...stepsAfterQualifications,
    ],
    [withQualifications]
  );
  const navigation = useNavigation();
  const { params } = useRoute<{
    key: string;
    name: string;
    params: { index: number; membershipId: string };
  }>();
  const notify = useNotifications();
  const methods = useUserWizardForm({
    startIndex: params.index || 0,
    onSuccess: () => {
      navigation.goBack();
      notify.success(i18n.t('forms.user_wizard.profileUpdated'));
    },
    onClose: () => {
      navigation.goBack();
    },
  });

  return <Wizard ref={wizard} dots {...{ steps }} {...methods} />;
}

export function UserWizardScreen() {
  const { params } = useRoute<{
    key: string;
    name: string;
    params: { index: number; membershipId: string };
  }>();
  const { membershipId } = params;

  return (
    <UserProfileProvider id={membershipId}>
      <UserWizard />
    </UserProfileProvider>
  );
}
