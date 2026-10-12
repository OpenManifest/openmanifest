import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import camelCase from 'lodash/camelCase';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOperatorContext } from 'app/providers/operator/context';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { isEqual } from 'lodash';
import { OperatorInput, Permission } from 'app/api/schema.d';
import { useNotifications } from 'app/providers/notifications';
import { OperatorEssentialsFragment, FederationEssentialsFragment } from 'app/api/operations';
import { useFederationsQuery } from 'app/api/reflection';
import useRestriction from 'app/hooks/useRestriction';
import i18n from 'app/i18n';
import { formatCallSchedule, parseCallSchedule } from 'app/utils/callSchedule';
import { UnitSystem, unitOf } from 'app/i18n/units';

export type OperatorFields = Required<
  Omit<OperatorInput, 'settings' | 'federation' | 'id'> &
    Omit<NonNullable<OperatorInput['settings']>, 'callScheduleMinutes'> & {
      id: number;
      federation: FederationEssentialsFragment | null;
      /** The minutes of the boarding calls as the person types them: "20, 15, 10" */
      callSchedule: string;
      /** The units shown, one per quantity an operator chooses */
      unitAltitude: string;
      unitDistance: string;
      unitMass: string;
      unitSpeed: string;
      unitTemperature: string;
      currency: string;
    }
>;

export const operatorValidation = yup.object({
  name: yup.string().nullable().default(null),
  federation: yup.object().required(() => i18n.t('forms.operator.yourDropzoneMustBePartOf')),
  lat: yup.number().nullable(),
  lng: yup.number().nullable(),
  primaryColor: yup.string(),
  requireRigInspection: yup.boolean(),
  requireLicense: yup.boolean(),
  requireCredits: yup.boolean(),
  requireMembership: yup.boolean(),
  allowNegativeCredits: yup.boolean(),
  allowManifestBypass: yup.boolean(),
  allowDoubleManifesting: yup.boolean(),
  allowSelfManifest: yup.boolean(),
  unitAltitude: yup.string(),
  unitDistance: yup.string(),
  unitMass: yup.string(),
  unitSpeed: yup.string(),
  unitTemperature: yup.string(),
  currency: yup.string(),
  callSchedule: yup
    .string()
    .default('')
    .test(
      'call-schedule',
      () => i18n.t('forms.operator.callScheduleInvalid'),
      (value) => parseCallSchedule(value) !== null
    ),
});

export const EMPTY_FORM_VALUES: Partial<OperatorFields> = {
  id: undefined,
  federation: null,
  lat: null,
  lng: null,
  primaryColor: null,
  requireRigInspection: true,
  requireMembership: true,
  allowNegativeCredits: false,
  allowManifestBypass: false,
  allowSelfManifest: true,
  requireCredits: true,
  requireLicense: true,
  callSchedule: '',
  unitAltitude: 'ft',
  unitDistance: 'km',
  unitMass: 'kg',
  unitSpeed: 'kn',
  unitTemperature: 'c',
  currency: 'AUD',
};

export interface IUseManifestFormOpts {
  initial?: Partial<OperatorFields>;
  onSuccess?(operator: OperatorEssentialsFragment): void;
}

export default function useOperatorForm(opts: IUseManifestFormOpts) {
  const { initial, onSuccess } = opts;
  const notify = useNotifications();
  const { data } = useFederationsQuery();
  const {
    operator: { operator },
  } = useOperatorContext();
  const initialValues = React.useMemo(
    () => ({
      ...EMPTY_FORM_VALUES,
      id: operator?.id ? Number(operator?.id) : undefined,
      lat: operator?.lat || undefined,
      lng: operator?.lng || undefined,
      federation: operator?.federation || data?.federations?.[0] || undefined,
      name: operator?.name || undefined,
      primaryColor: operator?.primaryColor || undefined,
      secondaryColor: operator?.secondaryColor || undefined,
      allowManifestBypass: operator?.settings?.allowManifestBypass,
      allowNegativeCredits: operator?.settings?.allowNegativeCredits,
      allowDoubleManifesting: operator?.settings?.allowDoubleManifesting,
      allowSelfManifest: operator?.settings?.allowSelfManifest ?? true,
      requireCredits: operator?.settings?.requireCredits,
      requireLicense: operator?.settings?.requireLicense,
      requireMembership: operator?.settings?.requireMembership,
      requireRigInspection: operator?.settings?.requireRigInspection,
      isCreditSystemEnabled: operator?.isCreditSystemEnabled,
      requireEquipment: operator?.settings?.requireEquipment,
      callSchedule: formatCallSchedule(operator?.callScheduleMinutes),
      unitAltitude: unitOf('altitude', operator?.units as UnitSystem),
      unitDistance: unitOf('distance', operator?.units as UnitSystem),
      unitMass: unitOf('mass', operator?.units as UnitSystem),
      unitSpeed: unitOf('speed', operator?.units as UnitSystem),
      unitTemperature: unitOf('temperature', operator?.units as UnitSystem),
      currency: operator?.currency ?? 'AUD',
      ...initial,
    }),
    [
      initial,
      operator?.name,
      data?.federations,
      operator?.primaryColor,
      operator?.secondaryColor,
      operator?.settings?.allowManifestBypass,
      operator?.settings?.allowNegativeCredits,
      operator?.settings?.allowDoubleManifesting,
      operator?.settings?.allowSelfManifest,
      operator?.settings?.requireCredits,
      operator?.settings?.requireLicense,
      operator?.settings?.requireMembership,
      operator?.settings?.requireRigInspection,
      operator?.isCreditSystemEnabled,
      operator?.id,
      operator?.lat,
      operator?.lng,
      operator?.federation,
      operator?.settings?.requireEquipment,
      operator?.callScheduleMinutes,
      operator?.units,
      operator?.currency,
    ]
  );

  const [defaultValues, setDefaultValues] = React.useState(initialValues);

  const methods = useForm<OperatorFields>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(operatorValidation),
  });
  React.useEffect(() => {
    if (!isEqual(defaultValues, initialValues)) {
      setDefaultValues(initialValues);
    }
  }, [defaultValues, initialValues]);

  const { reset } = methods;
  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const { handleSubmit, setError } = methods;
  const {
    operator: { update },
  } = useOperatorContext();
  const canUpdateOperator = useRestriction(Permission.UpdateOperator);

  const [{ loading }, onUpdate] = useAsyncFn(
    async (fields: OperatorFields) => {
      try {
        if (!canUpdateOperator) {
          return { error: "You don't have permission to update this dropzone" };
        }
        // Throws when the fields are invalid
        operatorValidation.validateSync(fields);
        const {
          id,
          banner,
          isCreditSystemEnabled,
          federation,
          primaryColor,
          lat,
          lng,
          name,
          requestPublication,
          secondaryColor,
          isPublic,
          callSchedule,
          unitAltitude,
          unitDistance,
          unitMass,
          unitSpeed,
          unitTemperature,
          currency,
          ...settings
        } = fields;

        const response = await update({
          banner,
          federation: federation?.id ? Number(federation?.id) : undefined,
          primaryColor,
          lat,
          lng,
          name,
          requestPublication,
          isCreditSystemEnabled,
          isPublic,
          currency,
          settings: {
            ...settings,
            callScheduleMinutes: parseCallSchedule(callSchedule) ?? [],
            units: {
              ...(operator?.units as UnitSystem),
              altitude: unitAltitude,
              distance: unitDistance,
              mass: unitMass,
              speed: unitSpeed,
              temperature: unitTemperature,
            },
          },
        });

        if ('fieldErrors' in response) {
          response.fieldErrors?.forEach(({ field, message }) => {
            setError(camelCase(field) as keyof OperatorFields, { type: 'custom', message });
          });
        }
        if ('operator' in response) {
          notify.success(i18n.t('forms.operator.yourChangesHaveBeenSaved'));
          onSuccess?.(response.operator);
        }
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          notify.error(error.message);
        }
      }
    },
    [update, setError, canUpdateOperator, notify, onSuccess]
  );

  const onSubmit = React.useMemo(
    () => handleSubmit(onUpdate, console.error),
    [handleSubmit, onUpdate]
  );

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
