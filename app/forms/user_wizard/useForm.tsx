import * as React from 'react';

import { useStep as useAskForRigStep } from '../../components/carousel_wizard/steps/AskForRig';
import { useStep as useAvatarStep } from 'app/components/carousel_wizard/steps/Avatar';
import { useStep as useFederationStep } from 'app/components/carousel_wizard/steps/Federation';
import { useStep as useFederationNumberStep } from 'app/components/carousel_wizard/steps/FederationNumber';
import { useStep as useLicenseStep } from 'app/components/carousel_wizard/steps/License';
import { useStep as useNicknameStep } from 'app/components/carousel_wizard/steps/Nickname';
import { useStep as useRealNameStep } from 'app/components/carousel_wizard/steps/RealName';
import { useStep as useReserveRepackStep } from 'app/components/carousel_wizard/steps/ReserveRepack';
import { useStep as useRigStep } from 'app/components/carousel_wizard/steps/Rig';
import { useStep as useWingloadingStep } from 'app/components/carousel_wizard/steps/Wingloading';
import { useUserProfileContext } from 'app/api/crud';
import { useEquipment } from 'app/api/crud/useEquipment';
import { useWizardForm } from 'app/hooks/forms';
import { useMemo } from 'app/hooks/react';
import { isEqual } from 'lodash';
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
  const step4 = useFederationStep();
  const step5 = useFederationNumberStep();
  const step6 = useLicenseStep();
  const step7 = useAskForRigStep();
  const step8 = useRigStep();
  const step9 = useReserveRepackStep();
  const step10 = useWingloadingStep();

  const steps = useMemo(
    () => [step1, step2, step3, step4, step5, step6, step7, step8, step9, step10],
    [step1, step10, step2, step3, step4, step5, step6, step7, step8, step9]
  );

  const { update, dropzoneUser, joinFederation } = useUserProfileContext();
  const equipment = useEquipment();

  const methods = useWizardForm({
    startIndex,
    steps
  });

  const { restore, createHandlers, setValue, setError, getStepIndexByFieldName } = methods;

  const handlers = useMemo(
    () =>
      createHandlers({
        onClose,
        onSuccess,
        onSubmit: async (fields, initial) => {
          try {
            if (!dropzoneUser?.id) return;
            setLoading(true);
            const {
              stepIndex = 0,
              lastStepIndex = 0,
              apfNumber,
              avatar,
              canopySize,
              exitWeight,
              federation,
              hasRig,
              license,
              make,
              model,
              name,
              nickname,
              repackExpiresAt,
              rigId,
              serial
            } = fields;
            console.debug(`== SUBMITTING STEP ${stepIndex} ==`);
            console.debug(fields);

            if ([3, 4, 5].includes(stepIndex)) {
              if (stepIndex === 4 && !apfNumber) return true;
              if (!federation?.id) {
                setError('federation', { message: 'You must select a federation', type: 'required' });
                return false;
              }

              if (!license?.id && stepIndex === 5) {
                setError('license', { message: 'You must select a license', type: 'required' });
                return false;
              }

              if (
                initial?.federation?.id === federation?.id &&
                initial?.license?.id === license?.id &&
                initial?.apfNumber === apfNumber
              )
                return true;

              const federationResponse = await joinFederation({
                federation: federation.id,
                license: license?.id,
                uid: apfNumber
              });

              if ('error' in federationResponse) {
                console.log('Federation error??');
                return setError('federation', { message: federationResponse.error, type: 'required' });
              }

              if ('userFederation' in federationResponse && federationResponse.userFederation.license) {
                console.debug('Setting license', federationResponse.userFederation.license);
                setValue('license', federationResponse.userFederation.license);
              }
              return true;
            }

            if (stepIndex === 6 && !hasRig) {
              setValue('stepIndex', lastStepIndex);
              return false;
            }

            if (hasRig && stepIndex >= 7 && stepIndex < lastStepIndex) {
              if (
                isEqual(
                  { repackExpiresAt, make, model, serial, canopySize },
                  {
                    repackExpiresAt: initial?.repackExpiresAt,
                    make: initial?.make,
                    model: initial?.model,
                    serial: initial?.serial,
                    canopySize: initial?.canopySize
                  }
                )
              ) {
                return true;
              }
              const rigResponse = await equipment.add({
                userId: Number(dropzoneUser.user.id),
                repackExpiresAt,
                make,
                model,
                serial,
                canopySize,
                id: rigId || undefined
              });
              if ('error' in rigResponse) {
                setError('serial', { message: rigResponse.error, type: 'required' });
                return false;
              }
              if ('fieldErrors' in rigResponse) {
                rigResponse.fieldErrors?.forEach(({ field, message }) => {
                  if (field === 'make') return setError('make', { message, type: 'required' });
                  if (field === 'model') return setError('model', { message, type: 'required' });
                  if (field === 'serial') return setError('serial', { message, type: 'required' });
                  if (field === 'canopySize') return setError('canopySize', { message, type: 'required' });
                });
                return false;
              }
              if ('rig' in rigResponse) {
                setValue('rigId', rigResponse.rig.id);
                setValue('make', rigResponse.rig.make || '');
                setValue('model', rigResponse.rig.model || '');
                setValue('serial', rigResponse.rig.serial || '');
                setValue('stepIndex', stepIndex + 1);
              }
              return false;
            }

            if (stepIndex === lastStepIndex) {
              const result = await update({
                exitWeight,
                image: avatar || undefined,
                license: license?.id ? Number(license.id) : null,
                nickname,
                name
              });

              if ('fieldErrors' in result) {
                result.fieldErrors?.forEach(({ field, message }) => {
                  if (field === 'name') return setError('name', { message, type: 'required' });
                  if (field === 'nickname') return setError('nickname', { message, type: 'required' });
                  if (field === 'license') return setError('license', { message, type: 'required' });
                  if (field === 'exitWeight') return setError('exitWeight', { message, type: 'required' });
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
        }
      }),
    [
      onSuccess,
      restore,
      getStepIndexByFieldName,
      createHandlers,
      dropzoneUser?.id,
      dropzoneUser?.user.id,
      equipment,
      joinFederation,
      setError,
      setValue,
      onClose,
      update
    ]
  );

  return React.useMemo(() => ({ ...methods, ...handlers, loading }), [methods, handlers, loading]);
}
