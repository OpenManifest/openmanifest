import * as React from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'app/ui';
import type { ManifestValidation } from 'app/hooks/useManifestValidator';

/** What the server says about the slot being put together: what stops it, what may be let through, what runs out soon */
export default function EligibilityMessages(
  props: Pick<ManifestValidation, 'failures' | 'expiring'>
) {
  const { failures, expiring } = props;
  const theme = useTheme();
  if (!failures.length && !expiring.length) return null;

  return (
    <View testID="eligibility-messages" style={{ gap: theme.space.xs, padding: theme.space.sm }}>
      {failures.map((result) => (
        <Text
          key={`${result.code}-${result.problem}`}
          variant="caption"
          testID={`eligibility-${result.bypassed ? 'warning' : 'failure'}-${result.code}`}
          tone={result.bypassed ? 'muted' : 'blocked'}
        >
          {result.message}
          {result.bypassed ? ' (you may let this through)' : ''}
        </Text>
      ))}
      {expiring.map((result) => (
        <Text
          key={`expiring-${result.code}`}
          variant="caption"
          testID={`eligibility-expiring-${result.code}`}
          tone="muted"
        >
          {`${result.code.replace(/_/g, ' ')} runs out soon`}
        </Text>
      ))}
    </View>
  );
}
