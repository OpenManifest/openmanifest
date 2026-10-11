import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { useOperatorContext } from 'app/providers/operator/context';

/**
 * One line in place of the add actions: shown to a member who cannot manifest anybody because the operator has
 * switched off self-manifesting (the API then leaves out the self-service slot permissions).
 */
export default function ManifestDeskNote() {
  const theme = useTheme();
  const {
    operator: { operator },
  } = useOperatorContext();
  const canManifestSelf = useRestriction(Permission.CreateSlot);
  const canManifestOthers = useRestriction(Permission.CreateUserSlot);

  if (operator?.settings?.allowSelfManifest !== false || canManifestSelf || canManifestOthers) {
    return null;
  }
  return (
    <Text
      testID="manifest-desk-note"
      style={[styles.note, { color: theme.colors.onSurfaceVariant }]}
    >
      Bookings are made at the manifest desk
    </Text>
  );
}

const styles = StyleSheet.create({
  note: { paddingHorizontal: 16, paddingVertical: 8 },
});
