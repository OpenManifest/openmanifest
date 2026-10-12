import * as React from 'react';
import Wizard from 'app/components/carousel_wizard/HookFormWizard';
import { IWizardStepDefinition, WizardRef } from 'app/components/carousel_wizard/Wizard';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useNotifications } from 'app/providers/notifications';
import FederationStep from './steps/Federation';
import FederationNumberStep from './steps/FederationNumber';
import RealNameStep from './steps/RealName';
import NicknameStep from './steps/Nickname';
import LicenseStep from './steps/License';
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

const steps = [
  RealNameStep,
  NicknameStep,
  AvatarStep,
  FederationStep,
  FederationNumberStep,
  LicenseStep,
  AskForRigStep,
  RigStep,
  ReserveRepackStep,
  WingloadingStep,
  DoneStep,
];
export function UserWizard() {
  const wizard = React.useRef<WizardRef>(null);
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
