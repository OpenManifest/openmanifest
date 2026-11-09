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
import QualificationsStep from './steps/Qualifications';
import DoneStep from './steps/Done';
import { PARACHUTE_STEPS } from 'app/features/skydiving/wizard';
import AvatarStep from './steps/Avatar';
import DateOfBirthStep from './steps/DateOfBirth';
import { useWizardParts } from './modules';
import { useUserWizardForm } from './useForm';
import { UserProfileProvider, useUserProfileContext } from 'app/api/crud';
import { useOperatorContext } from 'app/providers';
import { FormProvider, useWatch } from 'react-hook-form';
import i18n from 'app/i18n';

const stepsAlways = [RealNameStep, NicknameStep, AvatarStep];
const certificationSteps = [
  CertificationBodyStep,
  CertificationBodyNumberStep,
  CertificationLevelStep,
];
const stepsAfter = [DoneStep];
export function UserWizard() {
  const wizard = React.useRef<WizardRef>(null);
  // Steps that only some operators' modules ask for: certifications and qualifications, the date of birth, and the
  // questions about a skydiver's parachute (in the order of `wizardLayout`)
  const {
    certifications: withCertifications,
    qualifications: withQualifications,
    dateOfBirth: withDateOfBirth,
    parachute: withParachute,
  } = useWizardParts();
  const steps = React.useMemo(
    () => [
      ...stepsAlways,
      ...(withCertifications ? certificationSteps : []),
      ...(withQualifications ? [QualificationsStep] : []),
      ...(withDateOfBirth ? [DateOfBirthStep] : []),
      ...(withParachute ? PARACHUTE_STEPS : []),
      ...stepsAfter,
    ],
    [withCertifications, withQualifications, withDateOfBirth, withParachute]
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
