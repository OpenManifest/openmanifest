import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { StackActions, useLinkTo, useNavigation } from '@react-navigation/native';
import {
  useCreateOperatorMutation,
  useCreateVehicleMutation,
  useIndustriesQuery,
  useUpdateOperatorMutation,
  useUpdateTicketTypeMutation,
} from 'app/api/reflection';
import useSelectOperator from 'app/hooks/useSelectOperator';
import { useNotifications } from 'app/providers/notifications';
import { Stack, Text } from 'app/ui';
import WizardShell from './WizardShell';
import IndustryStep from './steps/IndustryStep';
import { CertificationsStep, LocationStep, MoneyStep, NameStep } from './steps/BasicSteps';
import BrandingStep from './steps/BrandingStep';
import ReviewStep from './steps/ReviewStep';
import {
  centsOf,
  initialValues,
  operatorAttributes,
  stepOfField,
  stepsFor,
  validateStep,
  withIndustry,
  type IndustryTemplate,
  type StepKey,
  type WizardErrors,
  type WizardValues,
} from './wizard';

type FieldErrors = { field: string; message: string }[] | null | undefined;

/**
 * Creating an operator (P7.23, GENERALISATION §6): the industry first, then name, location and time zone, money and
 * units, certification bodies (when the template has them), branding, a review of the presets (prices, first vehicle)
 * and done. Everything after the industry is pre-filled from the template and the device. The operator is created when
 * the branding step is left; going back and forward again updates it.
 */
export default function OperatorWizardScreen() {
  const { t } = useTranslation(['common', 'terms']);
  const navigation = useNavigation();
  const linkTo = useLinkTo();
  const notify = useNotifications();
  const selectOperator = useSelectOperator();

  const [values, setValues] = React.useState<WizardValues>(initialValues);
  const [errorKeys, setErrorKeys] = React.useState<WizardErrors>({});
  const [serverErrors, setServerErrors] = React.useState<Partial<Record<string, string>>>({});
  const [step, setStep] = React.useState<StepKey>('industry');
  const [busy, setBusy] = React.useState(false);

  const { data, loading } = useIndustriesQuery();
  const industries = React.useMemo(() => data?.industries ?? [], [data?.industries]);
  const industry = industries.find(({ slug }) => slug === values.industry) ?? null;
  const steps = stepsFor(industry);
  const index = Math.max(0, steps.indexOf(step));

  const [createOperator] = useCreateOperatorMutation();
  const [updateOperator] = useUpdateOperatorMutation();
  const [updateTicketType] = useUpdateTicketTypeMutation();
  const [createVehicle] = useCreateVehicleMutation();

  const operatorWord = t('terms:operator').toLowerCase();
  const errors = React.useMemo(() => {
    const translated: Partial<Record<keyof WizardValues, string>> = {};
    (Object.keys(errorKeys) as (keyof WizardValues)[]).forEach((field) => {
      translated[field] = t(`onboarding.errors.${errorKeys[field]}`, { operator: operatorWord });
    });
    return { ...translated, ...serverErrors };
  }, [errorKeys, operatorWord, serverErrors, t]);

  const set = React.useCallback((patch: Partial<WizardValues>) => {
    setValues((current) => ({ ...current, ...patch }));
    const fields = Object.keys(patch);
    const without = <T extends object>(map: T): T =>
      Object.fromEntries(Object.entries(map).filter(([key]) => !fields.includes(key))) as T;
    setErrorKeys(without);
    setServerErrors(without);
  }, []);

  const onPick = React.useCallback(
    (template: IndustryTemplate) => {
      if (values.id) return;
      setValues((current) => withIndustry(current, template));
      setErrorKeys({});
    },
    [values.id]
  );

  /** Marks the fields the server rejected and goes to the first step that shows one */
  const showFieldErrors = React.useCallback(
    (fieldErrors: FieldErrors, messages?: string[] | null) => {
      const marked: Record<string, string> = {};
      (fieldErrors ?? []).forEach(({ field, message }) => {
        const name = field.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
        marked[name === 'certificationBodyIds' ? 'certificationBodies' : name] = message;
      });
      setServerErrors(marked);
      const first = Object.keys(marked)
        .map(stepOfField)
        .find((key): key is StepKey => !!key && steps.includes(key));
      if (first) setStep(first);
      (messages ?? []).forEach((message) => notify.error(message));
      if (!first && !messages?.length && !fieldErrors?.length) notify.error(t('onboarding.failed'));
    },
    [notify, steps, t]
  );

  /** Creates the operator, or updates it when the owner came back; resolves to whether it may go on */
  const saveOperator = React.useCallback(async (): Promise<boolean> => {
    const attributes = operatorAttributes(values, industry);
    try {
      if (!values.id) {
        const result = await createOperator({
          variables: {
            industry: values.industry as NonNullable<WizardValues['industry']>,
            ...attributes,
          },
        });
        const payload = result.data?.createOperator;
        if (!payload?.operator?.id || payload.errors?.length || payload.fieldErrors?.length) {
          showFieldErrors(payload?.fieldErrors, payload?.errors);
          return false;
        }
        setValues((current) => ({ ...current, id: String(payload.operator?.id) }));
        await selectOperator(payload.operator);
        return true;
      }
      const result = await updateOperator({
        variables: { id: Number(values.id), attributes },
      });
      const payload = result.data?.updateOperator;
      if (payload?.errors?.length || payload?.fieldErrors?.length) {
        showFieldErrors(payload.fieldErrors, payload.errors);
        return false;
      }
      return true;
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t('onboarding.failed'));
      return false;
    }
  }, [
    createOperator,
    industry,
    notify,
    selectOperator,
    showFieldErrors,
    t,
    updateOperator,
    values,
  ]);

  /** Saves the prices changed and the first vehicle; resolves to whether it may go on */
  const saveReview = React.useCallback(async (): Promise<boolean> => {
    try {
      for (const [id, price] of Object.entries(values.prices)) {
        const result = await updateTicketType({
          variables: { id: Number(id), attributes: { costCents: centsOf(price) } },
        });
        const failed = result.data?.updateTicketType?.errors;
        if (failed?.length) {
          failed.forEach((message) => notify.error(message));
          return false;
        }
      }
      setValues((current) => ({ ...current, prices: {} }));
      if (values.vehicleName.trim() && !values.vehicleId) {
        const result = await createVehicle({
          variables: {
            attributes: {
              operatorId: Number(values.id),
              name: values.vehicleName.trim(),
              capacity: values.vehicleCapacity,
            },
          },
        });
        const payload = result.data?.createVehicle;
        if (!payload?.vehicle?.id) {
          (payload?.errors?.length ? payload.errors : [t('onboarding.failed')]).forEach((message) =>
            notify.error(message)
          );
          return false;
        }
        setValues((current) => ({ ...current, vehicleId: String(payload.vehicle?.id) }));
      }
      return true;
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t('onboarding.failed'));
      return false;
    }
  }, [createVehicle, notify, t, updateTicketType, values]);

  const finish = React.useCallback(() => {
    navigation.dispatch(
      StackActions.replace('Authenticated', {
        screen: 'Manifest',
        params: { screen: 'ManifestScreen' },
      })
    );
  }, [navigation]);

  const onNext = React.useCallback(async () => {
    const invalid = validateStep(step, values);
    if (Object.keys(invalid).length) {
      setErrorKeys(invalid);
      return;
    }
    if (step === 'done') {
      finish();
      return;
    }
    setBusy(true);
    try {
      if (step === 'branding' && !(await saveOperator())) return;
      if (step === 'review' && !(await saveReview())) return;
      setStep(steps[index + 1]);
    } finally {
      setBusy(false);
    }
  }, [finish, index, saveOperator, saveReview, step, steps, values]);

  const onBack = React.useCallback(() => {
    setErrorKeys({});
    if (index === 0) navigation.goBack();
    else setStep(steps[index - 1]);
  }, [index, navigation, steps]);

  const onOpenRules = React.useCallback(async () => {
    setBusy(true);
    const saved = await saveReview().finally(() => setBusy(false));
    if (saved) linkTo('/configuration/rules');
  }, [linkTo, saveReview]);

  const stepProps = { values, set, errors, industry };
  const words = { operator: operatorWord, name: industry?.name ?? '' };

  return (
    <WizardShell
      index={index}
      count={steps.length}
      title={t(`onboarding.steps.${step}.title`, words)}
      intro={t(`onboarding.steps.${step}.intro`, words)}
      nextLabel={step === 'done' ? t('onboarding.openManifest') : t('wizard.next')}
      busy={busy}
      onNext={onNext}
      // Nothing to go back to once the operator is ready
      onBack={step === 'done' ? undefined : onBack}
    >
      {step === 'industry' ? (
        <IndustryStep {...stepProps} industries={industries} loading={loading} onPick={onPick} />
      ) : null}
      {step === 'name' ? <NameStep {...stepProps} /> : null}
      {step === 'location' ? <LocationStep {...stepProps} /> : null}
      {step === 'money' ? <MoneyStep {...stepProps} /> : null}
      {step === 'certifications' ? <CertificationsStep {...stepProps} /> : null}
      {step === 'branding' ? <BrandingStep {...stepProps} /> : null}
      {step === 'review' ? <ReviewStep {...stepProps} onOpenRules={onOpenRules} /> : null}
      {step === 'done' ? (
        <Stack gap="sm" testID="wizard-done">
          <Text>{t('onboarding.ready', { name: values.name.trim() })}</Text>
        </Stack>
      ) : null}
    </WizardShell>
  );
}
