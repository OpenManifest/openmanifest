import { useOperatorContext } from 'app/providers/operator/context';
import * as React from 'react';
import * as yup from 'yup';
import { ValidationError } from 'yup';

const schema = yup.object().shape({
  hasLicense: yup.boolean().isTrue('You need to select a license on your user profile'),
  hasMembership: yup.boolean().isTrue('Your membership is out of date'),
  hasRigInspection: yup.boolean().isTrue('Your rig needs to be inspected before you can manifest'),
  hasReserveInDate: yup.boolean().isTrue('Your rig needs a reserve repack'),
  hasBodyMassKg: yup.boolean().isTrue('You need to set your exit weight on your profile'),
});

export default function useManifestValidator() {
  const {
    operator: { currentUser, operator },
  } = useOperatorContext();

  const canManifest = React.useCallback(
    async function CheckManifestRequirements() {
      try {
        await schema.validate(
          {
            hasLicense: currentUser?.hasLicense || !operator?.settings?.requireLicense,
            hasMembership: currentUser?.hasMembership || !operator?.settings?.requireMembership,
            hasRigInspection:
              currentUser?.hasRigInspection || !operator?.settings?.requireRigInspection,
            hasReserveInDate:
              currentUser?.hasReserveInDate || !operator?.settings?.requireReserveInDate,
          },
          { abortEarly: true }
        );
        return true;
      } catch (err) {
        if (err instanceof ValidationError) {
          throw err;
        }
        return false;
      }
    },
    [
      currentUser?.hasMembership,
      currentUser?.hasRigInspection,
      currentUser?.hasLicense,
      operator?.settings?.requireLicense,
      operator?.settings?.requireMembership,
      operator?.settings?.requireRigInspection,
      currentUser?.hasReserveInDate,
      operator?.settings?.requireReserveInDate,
    ]
  );

  return { canManifest };
}
