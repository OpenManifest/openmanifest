import * as React from 'react';

import { useStep as useAvatarStep } from './steps/Avatar';
import { useStep as useCertificationBodyStep } from './steps/CertificationBody';
import { useStep as useCertificationBodyNumberStep } from './steps/CertificationBodyNumber';
import { useStep as useCertificationLevelStep } from './steps/CertificationLevel';
import { useStep as useNicknameStep } from './steps/Nickname';
import {
  useStep as useQualificationsStep,
  useQualificationStepRequired,
} from './steps/Qualifications';
import { useStep as useRealNameStep } from './steps/RealName';
import {
  useAskForRigStep,
  useReserveRepackStep,
  useRigStep,
  useRigStepsRequired,
  useWingloadingStep,
} from 'app/features/skydiving/wizard';
import { RIG_KIND, canopySizeToSquareMetres, findRigKind } from 'app/features/skydiving/rig';
import { useOperatorContext } from 'app/providers/operator/context';
import { useOperatorFormat } from 'app/i18n/operatorFormat';
import { useUserProfileContext } from 'app/api/crud';
import { useEquipment } from 'app/api/crud/useEquipment';
import { useWizardForm } from 'app/hooks/forms';
import { useMemo } from 'app/hooks/react';
import { camelCase, isEqual } from 'lodash';
import i18n from 'app/i18n';
export interface IUserWizardFormOpts {
  startIndex: number;
  onSuccess?(): void;
  onClose?(): void;
}

export function useUserWizardForm(opts: IUserWizardFormOpts) {
  const { onClose, onSuccess, startIndex } = opts;
  const [loading, setLoading] = React.useState(false);

  const step1 = useRealNameStep();
  const step2 = useNicknameStep();
  const step3 = useAvatarStep();
  const step4 = useCertificationBodyStep();
  const step5 = useCertificationBodyNumberStep();
  const step6 = useCertificationLevelStep();
  const qualificationsStep = useQualificationsStep();
  const step7 = useAskForRigStep();
  const step8 = useRigStep();
  const step9 = useReserveRepackStep();
  const step10 = useWingloadingStep();
  // The qualification step follows the certification steps when the operator asks for qualifications, then come the
  // questions about a skydiver's rig when the operator has the rig kind; the steps after each move up
  const withQualifications = useQualificationStepRequired();
  const withRigs = useRigStepsRequired();
  const shift = withQualifications ? 1 : 0;
  const {
    operator: { operator },
  } = useOperatorContext();
  const rigKind = findRigKind(operator?.equipmentKinds);
  const units = useOperatorFormat((state) => state.units);

  const steps = useMemo(
    () => [
      step1,
      step2,
      step3,
      step4,
      step5,
      step6,
      ...(withQualifications ? [qualificationsStep] : []),
      ...(withRigs ? [step7, step8, step9, step10] : []),
    ],
    [
      qualificationsStep,
      step1,
      step10,
      step2,
      step3,
      step4,
      step5,
      step6,
      step7,
      step8,
      step9,
      withQualifications,
      withRigs,
    ]
  );

  const { update, membership, joinCertificationBody, addQualification } = useUserProfileContext();
  const equipment = useEquipment();

  const methods = useWizardForm({
    startIndex,
    steps,
  });

  const { restore, createHandlers, setValue, setError, getStepIndexByFieldName } = methods;

  const handlers = useMemo(
    () =>
      createHandlers({
        onClose,
        onSuccess,
        onSubmit: async (fields, initial) => {
          try {
            if (!membership?.id) return;
            setLoading(true);
            const {
              stepIndex = 0,
              lastStepIndex = 0,
              apfNumber,
              avatar,
              canopySize,
              bodyMassKg,
              certificationBody,
              hasRig,
              certificationLevel,
              make,
              model,
              name,
              nickname,
              serviceDueAt,
              rigId,
              serial,
              qualifications,
            } = fields;

            if ([3, 4, 5].includes(stepIndex)) {
              if (stepIndex === 4 && !apfNumber) return true;
              if (!certificationBody?.id) {
                setError('certificationBody', {
                  message: i18n.t('forms.user_wizard.youMustSelectACertificationBody'),
                  type: 'required',
                });
                return false;
              }

              if (!certificationLevel?.id && stepIndex === 5) {
                setError('certificationLevel', {
                  message: i18n.t('forms.user_wizard.youMustSelectACertificationLevel'),
                  type: 'required',
                });
                return false;
              }

              if (
                initial?.certificationBody?.id === certificationBody?.id &&
                initial?.certificationLevel?.id === certificationLevel?.id &&
                initial?.apfNumber === apfNumber
              )
                return true;

              const certificationBodyResponse = await joinCertificationBody({
                certificationBody: certificationBody.id,
                certificationLevel: certificationLevel?.id,
                uid: apfNumber,
              });

              if ('error' in certificationBodyResponse) {
                return setError('certificationBody', {
                  message: certificationBodyResponse.error,
                  type: 'required',
                });
              }

              if (
                'userCertification' in certificationBodyResponse &&
                certificationBodyResponse.userCertification.certificationLevel
              ) {
                setValue(
                  'certificationLevel',
                  certificationBodyResponse.userCertification.certificationLevel
                );
              }
              return true;
            }

            if (withQualifications && stepIndex === 6) {
              // Only what changed is saved; a qualification needs its number
              for (const [index, entry] of (qualifications ?? []).entries()) {
                const before = initial?.qualifications?.[index];
                if (
                  !entry?.number ||
                  (before?.number === entry.number && before?.expiresAt === entry.expiresAt)
                ) {
                  continue;
                }
                const response = await addQualification({
                  qualificationId: entry.qualificationId,
                  number: entry.number,
                  expiresAt: entry.expiresAt
                    ? new Date(entry.expiresAt * 1000).toISOString()
                    : undefined,
                });
                if ('error' in response) {
                  setError(`qualifications.${index}.number`, {
                    message: response.error,
                    type: 'required',
                  });
                  return false;
                }
              }
              return true;
            }

            // The questions about the jumper's rig: skip them for a jumper without one, save the rig step by step
            if (withRigs && stepIndex === 6 + shift && !hasRig) {
              setValue('stepIndex', lastStepIndex);
              return false;
            }

            if (withRigs && hasRig && stepIndex >= 7 + shift && stepIndex < lastStepIndex) {
              if (
                isEqual(
                  { serviceDueAt, make, model, serial, canopySize },
                  {
                    serviceDueAt: initial?.serviceDueAt,
                    make: initial?.make,
                    model: initial?.model,
                    serial: initial?.serial,
                    canopySize: initial?.canopySize,
                  }
                )
              ) {
                return true;
              }
              const equipmentResponse = await equipment.add({
                userId: Number(membership.user.id),
                kindId: rigKind?.id,
                serviceDueAt,
                make,
                model,
                serial,
                // The rig's attributes: the canopy size typed in the operator's unit is stored in square metres
                attributes: canopySize
                  ? { canopy_size_m2: canopySizeToSquareMetres(Number(canopySize), units) }
                  : undefined,
                id: rigId || undefined,
              });
              if ('error' in equipmentResponse) {
                setError('serial', { message: equipmentResponse.error, type: 'required' });
                return false;
              }
              if ('fieldErrors' in equipmentResponse) {
                equipmentResponse.fieldErrors?.forEach(({ field, message }) => {
                  const camelizedField = camelCase(field);
                  if (camelizedField === 'make')
                    return setError('make', { message, type: 'required' });
                  if (camelizedField === 'model')
                    return setError('model', { message, type: 'required' });
                  if (camelizedField === 'serial')
                    return setError('serial', { message, type: 'required' });
                  if (camelizedField === 'properties')
                    return setError('canopySize', { message, type: 'required' });
                  if (camelizedField in fields)
                    return setError(camelizedField as keyof typeof fields, { message });
                });
                return false;
              }
              if ('equipment' in equipmentResponse) {
                setValue('rigId', equipmentResponse.equipment.id);
                setValue('make', equipmentResponse.equipment.make || '');
                setValue('model', equipmentResponse.equipment.model || '');
                setValue('serial', equipmentResponse.equipment.serial || '');
                setValue('stepIndex', stepIndex + 1);
              }
              return false;
            }

            if (stepIndex === lastStepIndex) {
              const result = await update({
                bodyMassKg,
                image: avatar || undefined,
                certificationLevel: certificationLevel?.id ? Number(certificationLevel.id) : null,
                nickname,
                name,
              });

              if ('fieldErrors' in result) {
                result.fieldErrors?.forEach(({ field, message }) => {
                  const camelizedField = camelCase(field);
                  if (camelizedField === 'name')
                    return setError('name', { message, type: 'required' });
                  if (camelizedField === 'nickname')
                    return setError('nickname', { message, type: 'required' });
                  if (camelizedField === 'certificationLevel')
                    return setError('certificationLevel', { message, type: 'required' });
                  if (camelizedField === 'bodyMassKg')
                    return setError('bodyMassKg', { message, type: 'required' });
                  if (camelizedField in fields)
                    return setError(camelizedField as keyof typeof fields, { message });
                });

                const firstError = Math.min(
                  ...((result.fieldErrors
                    ?.map(({ field }) => {
                      return getStepIndexByFieldName(field);
                    })
                    .filter((i) => i !== -1) || []) as number[])
                );
                if (firstError !== -1) {
                  setValue('stepIndex', firstError);
                  return false;
                }
              } else {
                onSuccess?.();
                restore();
              }
            }
          } finally {
            setLoading(false);
          }
        },
      }),
    [
      onSuccess,
      restore,
      getStepIndexByFieldName,
      createHandlers,
      membership?.id,
      membership?.user.id,
      equipment,
      joinCertificationBody,
      addQualification,
      shift,
      withQualifications,
      withRigs,
      rigKind?.id,
      units,
      setError,
      setValue,
      onClose,
      update,
    ]
  );

  return React.useMemo(() => ({ ...methods, ...handlers, loading }), [methods, handlers, loading]);
}
