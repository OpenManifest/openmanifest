import { useDropzoneContext } from 'app/providers/dropzone/context';
import * as React from 'react';
import * as yup from 'yup';
import { ValidationError } from 'yup';

const schema = yup.object().shape({
  hasLicense: yup.boolean().isTrue('You need to select a license on your user profile'),
  hasMembership: yup.boolean().isTrue('Your membership is out of date'),
  hasRigInspection: yup.boolean().isTrue('Your rig needs to be inspected before you can manifest'),
  hasReserveInDate: yup.boolean().isTrue('Your rig needs a reserve repack'),
  hasExitWeight: yup.boolean().isTrue('You need to set your exit weight on your profile'),
});

export default function useManifestValidator() {
  const {
    dropzone: { currentUser, dropzone },
  } = useDropzoneContext();

  const canManifest = React.useCallback(
    async function CheckManifestRequirements() {
      try {
        await schema.validate({
          hasLicense: currentUser?.hasLicense || !dropzone?.settings?.requireLicense,
          hasMembership: currentUser?.hasMembership || !dropzone?.settings?.requireMembership,
          hasRigInspection: currentUser?.hasRigInspection || !dropzone?.settings?.requireRigInspection,
          hasReserveInDate: currentUser?.hasReserveInDate || !dropzone?.settings?.requireReserveInDate
        }, { abortEarly: true });
        return true;
      } catch (err) {
        if (err instanceof ValidationError) {
          throw err;
        }
        return false;
      }
    },
    [currentUser?.hasMembership, currentUser?.hasRigInspection, currentUser?.hasLicense, dropzone?.settings?.requireLicense, dropzone?.settings?.requireMembership, dropzone?.settings?.requireRigInspection, currentUser?.hasReserveInDate, dropzone?.settings?.requireReserveInDate]
  );

  return { canManifest };
}
