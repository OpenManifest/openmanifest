import { useOperatorContext } from 'app/providers/operator/context';
import * as React from 'react';
import * as yup from 'yup';
import { ValidationError } from 'yup';
import i18n from 'app/i18n';

const equipment = () => i18n.t('terms:equipment', { count: 1 }).toLowerCase();

const schema = yup.object().shape({
  hasCertificationLevel: yup.boolean().isTrue('You need to select a license on your user profile'),
  hasMembership: yup.boolean().isTrue('Your membership is out of date'),
  hasEquipmentInspection: yup
    .boolean()
    .isTrue(() => i18n.t('forms.equipment.needsInspection', { equipment: equipment() })),
  hasEquipmentInService: yup
    .boolean()
    .isTrue(() => i18n.t('forms.equipment.needsService', { equipment: equipment() })),
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
            hasCertificationLevel:
              currentUser?.hasCertificationLevel || !operator?.settings?.requireCertification,
            hasMembership: currentUser?.hasMembership || !operator?.settings?.requireMembership,
            hasEquipmentInspection:
              currentUser?.hasEquipmentInspection ||
              !operator?.settings?.requireEquipmentInspection,
            hasEquipmentInService:
              currentUser?.hasEquipmentInService || !operator?.settings?.requireEquipmentInService,
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
      currentUser?.hasEquipmentInspection,
      currentUser?.hasCertificationLevel,
      operator?.settings?.requireCertification,
      operator?.settings?.requireMembership,
      operator?.settings?.requireEquipmentInspection,
      currentUser?.hasEquipmentInService,
      operator?.settings?.requireEquipmentInService,
    ]
  );

  return { canManifest };
}
