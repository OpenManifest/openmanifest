import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { useOperatorContext } from 'app/providers/operator/context';
import { Text, useTheme } from 'app/ui';

/**
 * One line in place of the add actions: shown to a member who cannot manifest anybody because the operator has
 * switched off self-manifesting (the API then leaves out the self-service slot permissions).
 */
export default function ManifestDeskNote() {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const {
    operator: { operator },
  } = useOperatorContext();
  const canManifestSelf = useRestriction(Permission.CreateSlot);
  const canManifestOthers = useRestriction(Permission.CreateUserSlot);

  if (operator?.settings?.allowSelfManifest !== false || canManifestSelf || canManifestOthers) {
    return null;
  }
  return (
    <View style={{ paddingHorizontal: theme.space.lg, paddingVertical: theme.space.sm }}>
      <Text testID="manifest-desk-note" tone="muted">
        {t('legacy.manifestDeskNote')}
      </Text>
    </View>
  );
}
