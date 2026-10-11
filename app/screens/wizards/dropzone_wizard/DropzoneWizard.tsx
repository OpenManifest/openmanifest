import * as React from 'react';
import { FormProvider } from 'react-hook-form';
import { Wizard } from 'app/components/carousel_wizard';
import type { WizardRef } from 'app/components/carousel_wizard/Wizard';
import useMutationCreateDropzone from 'app/api/hooks/useMutationCreateDropzone';
import useMutationUpdateDropzone from 'app/api/hooks/useMutationUpdateDropzone';
import camelize from 'lodash/camelCase';
import { Permission } from 'app/api/schema.d';
import useSelectDropzone from 'app/hooks/useSelectDropzone';
import { StackActions, useNavigation } from '@react-navigation/native';
import { useNotifications } from 'app/providers/notifications';
import NameStep from './steps/Name';
import FederationStep from './steps/Federation';
import LocationStep from './steps/Location';
import ThemingStep from './steps/Theming';
import DoneStep from './steps/Done';
import PermissionStep from './steps/Permissions';
import LogoStep from './steps/Logo';
import { DropzoneWizardFields, useDropzoneWizardForm } from './useDropzoneWizardForm';

/** The wizard step that shows each field, to take the user back to a field the server rejected */
const STEP_OF_FIELD: Partial<Record<keyof DropzoneWizardFields, number>> = {
  name: 0,
  federation: 1,
  lat: 2,
  lng: 2,
  primaryColor: 3,
  secondaryColor: 3,
  banner: 4,
};

function DropzoneSetupScreen() {
  const form = useDropzoneWizardForm();
  const { getValues, setValue, setError, trigger } = form;
  const selectDropzone = useSelectDropzone();
  const navigation = useNavigation();
  const notify = useNotifications();
  const wizard = React.useRef<WizardRef>(undefined);

  const onFieldError = React.useCallback(
    (field: string, message: string) => {
      const name = camelize(field) as keyof DropzoneWizardFields;
      if (name in STEP_OF_FIELD) {
        setError(name, { type: 'server', message });
        wizard.current?.scrollTo({ index: STEP_OF_FIELD[name] as number });
      }
    },
    [setError]
  );

  const mutationCreateDropzone = useMutationCreateDropzone({
    onError: (error) => notify.error(error),
    onSuccess: () => null,
    onFieldError,
  });
  const mutationUpdateDropzone = useMutationUpdateDropzone({
    onError: (error) => notify.error(error),
    onSuccess: () => null,
    onFieldError,
  });
  const onComplete = React.useCallback(() => {
    navigation.dispatch(
      StackActions.replace('Authenticated', {
        screen: 'LeftDrawer',
        params: {
          screen: 'Manifest',
          params: {
            screen: 'ManifestScreen',
          },
        },
      })
    );
  }, [navigation]);

  /** Blocks the wizard on a step until the given fields are valid */
  const requireValid = React.useCallback(
    (...fields: (keyof DropzoneWizardFields)[]) =>
      async (): Promise<void> => {
        if (!(await trigger(fields))) {
          throw new Error();
        }
      },
    [trigger]
  );
  const onNameNext = React.useMemo(() => requireValid('name'), [requireValid]);
  const onFederationNext = React.useMemo(() => requireValid('name', 'federation'), [requireValid]);

  const onLogoNext = React.useCallback(async () => {
    if (!(await trigger())) {
      throw new Error();
    }
    const values = getValues();
    // Create or update dropzone
    const result = !values.id
      ? await mutationCreateDropzone.mutate({
          federation: Number(values.federation?.id),
          name: values.name,
          banner: values.banner,
          primaryColor: values.primaryColor,
          secondaryColor: values.secondaryColor,
          lat: values.lat as number,
          lng: values.lng as number,
        })
      : await mutationUpdateDropzone.mutate({
          id: Number(values.id),
          federation: Number(values.federation?.id),
          name: values.name,
          primaryColor: values.primaryColor,
          secondaryColor: values.secondaryColor,
          lat: values.lat,
          lng: values.lng,
          banner: values.banner,
        });

    if (!result?.errors?.length && result?.dropzone?.id) {
      setValue('id', String(result.dropzone.id));
      selectDropzone(result.dropzone);
    } else if (result?.fieldErrors?.length) {
      // onFieldError has marked the fields and moved the wizard
      throw new Error();
    }
  }, [
    getValues,
    mutationCreateDropzone,
    mutationUpdateDropzone,
    selectDropzone,
    setValue,
    trigger,
  ]);

  const noop = React.useCallback(() => Promise.resolve(), []);

  return (
    <FormProvider {...form}>
      <Wizard
        dots
        steps={[
          { onNext: onNameNext, component: NameStep },
          {
            onNext: onFederationNext,
            component: FederationStep,
          },
          { component: LocationStep },
          { component: ThemingStep, onNext: noop },
          {
            onNext: onLogoNext,
            component: LogoStep,
          },
          {
            component: (stepProps) => (
              <PermissionStep
                {...stepProps}
                permission={Permission.CreateSlot}
                title="Manifest"
                description="Who can manifest themselves on loads?"
              />
            ),
          },
          {
            component: (stepProps) => (
              <PermissionStep
                {...stepProps}
                description="Who can manifest other people on loads?"
                permission={Permission.CreateUserSlot}
                title="Manifest others"
              />
            ),
          },
          {
            component: DoneStep,
            onNext: async () => {
              selectDropzone({ id: getValues('id') });
              onComplete();
            },
          },
        ]}
      />
    </FormProvider>
  );
}

export default DropzoneSetupScreen;
