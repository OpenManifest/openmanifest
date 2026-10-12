import * as React from 'react';
import { FormProvider } from 'react-hook-form';
import { Wizard } from 'app/components/carousel_wizard';
import type { WizardRef } from 'app/components/carousel_wizard/Wizard';
import useMutationCreateOperator from 'app/api/hooks/useMutationCreateOperator';
import useMutationUpdateOperator from 'app/api/hooks/useMutationUpdateOperator';
import camelize from 'lodash/camelCase';
import { Industry, Permission } from 'app/api/schema.d';
import { resolveTimeZone } from 'app/utils/operatorTime';
import useSelectOperator from 'app/hooks/useSelectOperator';
import { StackActions, useNavigation } from '@react-navigation/native';
import { useNotifications } from 'app/providers/notifications';
import NameStep from './steps/Name';
import CertificationBodyStep from './steps/CertificationBody';
import LocationStep from './steps/Location';
import ThemingStep from './steps/Theming';
import DoneStep from './steps/Done';
import PermissionStep from './steps/Permissions';
import LogoStep from './steps/Logo';
import { OperatorWizardFields, useOperatorWizardForm } from './useOperatorWizardForm';

/** The wizard step that shows each field, to take the user back to a field the server rejected */
const STEP_OF_FIELD: Partial<Record<keyof OperatorWizardFields, number>> = {
  name: 0,
  certificationBodies: 1,
  lat: 2,
  lng: 2,
  primaryColor: 3,
  secondaryColor: 3,
  banner: 4,
};

function OperatorSetupScreen() {
  const form = useOperatorWizardForm();
  const { getValues, setValue, setError, trigger } = form;
  const selectOperator = useSelectOperator();
  const navigation = useNavigation();
  const notify = useNotifications();
  const wizard = React.useRef<WizardRef>(undefined);

  const onFieldError = React.useCallback(
    (field: string, message: string) => {
      const name = camelize(field) as keyof OperatorWizardFields;
      if (name in STEP_OF_FIELD) {
        setError(name, { type: 'server', message });
        wizard.current?.scrollTo({ index: STEP_OF_FIELD[name] as number });
      }
    },
    [setError]
  );

  const mutationCreateOperator = useMutationCreateOperator({
    onError: (error) => notify.error(error),
    onSuccess: () => null,
    onFieldError,
  });
  const mutationUpdateOperator = useMutationUpdateOperator({
    onError: (error) => notify.error(error),
    onSuccess: () => null,
    onFieldError,
  });
  const onComplete = React.useCallback(() => {
    navigation.dispatch(
      StackActions.replace('Authenticated', {
        screen: 'Manifest',
        params: {
          screen: 'ManifestScreen',
        },
      })
    );
  }, [navigation]);

  /** Blocks the wizard on a step until the given fields are valid */
  const requireValid = React.useCallback(
    (...fields: (keyof OperatorWizardFields)[]) =>
      async (): Promise<void> => {
        if (!(await trigger(fields))) {
          throw new Error();
        }
      },
    [trigger]
  );
  const onNameNext = React.useMemo(() => requireValid('name'), [requireValid]);
  const onCertificationBodyNext = React.useMemo(
    () => requireValid('name', 'certificationBodies'),
    [requireValid]
  );

  const onLogoNext = React.useCallback(async () => {
    if (!(await trigger())) {
      throw new Error();
    }
    const values = getValues();
    // Create or update operator
    const result = !values.id
      ? await mutationCreateOperator.mutate({
          // Until the wizard asks for an industry (P7.23) every new operator is a skydiving one, in the device's zone
          industry: Industry.Skydiving,
          timeZone: resolveTimeZone(),
          certificationBodyIds: values.certificationBodies.map(({ id }) => Number(id)),
          name: values.name,
          banner: values.banner,
          primaryColor: values.primaryColor,
          secondaryColor: values.secondaryColor,
          lat: values.lat as number,
          lng: values.lng as number,
        })
      : await mutationUpdateOperator.mutate({
          id: Number(values.id),
          certificationBodyIds: values.certificationBodies.map(({ id }) => Number(id)),
          name: values.name,
          primaryColor: values.primaryColor,
          secondaryColor: values.secondaryColor,
          lat: values.lat,
          lng: values.lng,
          banner: values.banner,
        });

    if (!result?.errors?.length && result?.operator?.id) {
      setValue('id', String(result.operator.id));
      selectOperator(result.operator);
    } else if (result?.fieldErrors?.length) {
      // onFieldError has marked the fields and moved the wizard
      throw new Error();
    }
  }, [
    getValues,
    mutationCreateOperator,
    mutationUpdateOperator,
    selectOperator,
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
            onNext: onCertificationBodyNext,
            component: CertificationBodyStep,
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
              selectOperator({ id: getValues('id') });
              onComplete();
            },
          },
        ]}
      />
    </FormProvider>
  );
}

export default OperatorSetupScreen;
