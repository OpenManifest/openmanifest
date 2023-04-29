import * as React from 'react';
import Wizard from 'app/components/carousel_wizard/HookFormWizard';
import { StackActions, useNavigation } from '@react-navigation/core';
import { useNotifications } from 'app/providers/notifications';
import NameStep, { useStep as useNameStep } from 'app/components/carousel_wizard/steps/Name';
import FederationStep, { useStep as useFederationStep } from 'app/components/carousel_wizard/steps/Federation';
import { LocationStep, useStep as useLocationStep } from 'app/components/carousel_wizard/steps/Location';
import ThemingStep, { useStep as useThemingStep } from 'app/components/carousel_wizard/steps/Theming';
import DoneStep from 'app/components/carousel_wizard/steps/Done';
import PermissionStep from 'app/components/carousel_wizard/steps/Permissions';
import LogoStep, { useStep as useLogoStep } from 'app/components/carousel_wizard/steps/Avatar';
import { useMemo } from 'app/hooks/react';
import { useWizardForm } from 'app/hooks/forms';
import { useDropzonesContext } from 'app/api/crud';
import { useDropzoneContext } from 'app/providers';

const steps = [
  { title: 'Name', component: NameStep },
  { title: 'Federation', component: FederationStep },
  { title: 'Location', component: LocationStep },
  { title: 'Logo', component: LogoStep },
  { title: 'Theming', component: ThemingStep },
  // { title: 'Permissions', component: PermissionStep },
  { title: 'Done', component: DoneStep }
];

function DropzoneSetupScreen() {
  const step1 = useNameStep();
  const step2 = useFederationStep();
  const step3 = useLocationStep();
  const step4 = useThemingStep();
  const step5 = useLogoStep();
  const stepDefinitions = useMemo(() => [step1, step2, step3, step4, step5], [step1, step2, step3, step4, step5]);
  const methods = useWizardForm({
    steps: stepDefinitions
  });
  const { createHandlers } = methods;

  const navigation = useNavigation();
  const notify = useNotifications();
  const { create } = useDropzonesContext();
  const {
    dropzone: { update, dropzone }
  } = useDropzoneContext();

  const onComplete = React.useCallback(() => {
    navigation.dispatch(
      StackActions.replace('Authenticated', {
        screen: 'LeftDrawer',
        params: {
          screen: 'Manifest',
          params: {
            screen: 'ManifestScreen'
          }
        }
      })
    );
  }, [navigation]);

  const handlers = createHandlers({
    onSubmit: async (fields) => {
      try {
        if (fields.lastStepIndex !== fields.stepIndex) return true;
        if (dropzone?.id) {
          const updateResponse = await update({
            federation: Number(fields.federation?.id || dropzone?.federation?.id),
            lat: fields.coords?.lat || dropzone?.lat,
            lng: fields.coords?.lng || dropzone?.lng,
            name: fields.name || dropzone?.name || '',
            primaryColor: fields.primaryColor || dropzone?.primaryColor,
            banner: fields.avatar || undefined
          });

          if ('error' in updateResponse) {
            notify.error('Failed to update dropzone');
            console.log(updateResponse.error);
            return false;
          }
          if ('fieldErrors' in updateResponse) {
            const firstError = Math.min(
              ...(updateResponse?.fieldErrors
                ?.map(({ field }) => methods.getStepIndexByFieldName(field))
                ?.filter((idx) => idx !== undefined && idx > -1) as number[])
            );
            methods.setValue('stepIndex', firstError);
            return false;
          }
          notify.success('Dropzone updated');
          navigation.goBack();
        } else {
          const createResponse = await create({
            federation: fields.federation?.id,
            lat: fields.coords?.lat,
            lng: fields.coords?.lng,
            name: fields.name || '',
            primaryColor: fields.primaryColor,
            banner: fields.avatar || undefined
          });
          if ('error' in createResponse) {
            notify.error('Failed to update dropzone');
            return false;
          }
          if ('fieldErrors' in createResponse) {
            const firstError = Math.min(
              ...(createResponse?.fieldErrors
                ?.map(({ field }) => methods.getStepIndexByFieldName(field))
                ?.filter((idx) => idx !== undefined && idx > -1) as number[])
            );
            methods.setValue('stepIndex', firstError);
            return false;
          }
          notify.success('Dropzone created');
          navigation.goBack();
        }
      } finally {
      }
    }
  });

  return <Wizard dots steps={steps} {...methods} {...handlers} />;
}

export default DropzoneSetupScreen;
