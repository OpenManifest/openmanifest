import * as React from 'react';
import Wizard from 'app/components/carousel_wizard/HookFormWizard';
import { WizardRef } from 'app/components/carousel_wizard/Wizard';
import { useNavigation, useRoute } from '@react-navigation/core';
import { useNotifications } from 'app/providers/notifications';
import FederationStep from 'app/components/carousel_wizard/steps/Federation';
import FederationNumberStep from 'app/components/carousel_wizard/steps/FederationNumber';
import RealNameStep from 'app/components/carousel_wizard/steps/RealName';
import NicknameStep from 'app/components/carousel_wizard/steps/Nickname';
import LicenseStep from 'app/components/carousel_wizard/steps/License';
import RigStep from 'app/components/carousel_wizard/steps/Rig';
import ReserveRepackStep from 'app/components/carousel_wizard/steps/ReserveRepack';
import AskForRigStep from '../../components/carousel_wizard/steps/AskForRig';
import WingloadingStep from 'app/components/carousel_wizard/steps/Wingloading';
import DoneStep from 'app/components/carousel_wizard/steps/Done';
import AvatarStep from 'app/components/carousel_wizard/steps/Avatar';
import { useUserWizardForm } from './useForm';
import { UserProfileProvider } from 'app/api/crud';

const steps = [
  { title: 'Real Name', component: RealNameStep },
  { title: 'Nickname', component: NicknameStep },
  { title: 'Avatar', component: AvatarStep },
  { title: 'Affiliation', component: FederationStep },
  { title: 'APF Number', component: FederationNumberStep },
  { title: 'License', component: LicenseStep },
  { title: 'Got a rig?', component: AskForRigStep },
  { title: 'Equipment', component: RigStep },
  { title: 'Reserve Repack', component: ReserveRepackStep },
  { title: 'Wingloading', component: WingloadingStep },
  { title: 'Profile Updated', component: DoneStep }
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
