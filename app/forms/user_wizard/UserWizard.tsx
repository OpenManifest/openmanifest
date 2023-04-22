import * as React from 'react';
import Wizard from 'app/components/carousel_wizard/HookFormWizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { IWizardStepDefinition, WizardRef } from 'app/components/carousel_wizard/Wizard';
import { useNavigation, useRoute } from '@react-navigation/core';
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
import { useDropzoneContext } from 'app/providers';
import { FormProvider, useWatch } from 'react-hook-form';

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
  DoneStep
];
export function UserWizard() {
  const wizard = React.useRef<WizardRef>(null);
  const navigation = useNavigation();
  const { params } = useRoute<{ key: string; name: string; params: { index: number; dropzoneUserId: string } }>();
  const notify = useNotifications();
  const methods = useUserWizardForm({
    startIndex: params.index || 0,
    onSuccess: () => {
      navigation.goBack();
      notify.success('Profile updated');
    },
    onClose: () => {
      navigation.goBack();
    }
  });

  return <Wizard ref={wizard} dots {...{ steps }} {...methods} />;
}

export function UserWizardScreen() {
  const { params } = useRoute<{ key: string; name: string; params: { index: number; dropzoneUserId: string } }>();
  const { dropzoneUserId } = params;

  return (
    <UserProfileProvider id={dropzoneUserId}>
      <UserWizard />
    </UserProfileProvider>
  );
}
