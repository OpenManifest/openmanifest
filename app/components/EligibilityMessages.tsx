import * as React from 'react';
import { View } from 'react-native';
import { HelperText } from 'react-native-paper';
import type { ManifestValidation } from 'app/hooks/useManifestValidator';

/** What the server says about the slot being put together: what stops it, what may be let through, what runs out soon */
export default function EligibilityMessages(
  props: Pick<ManifestValidation, 'failures' | 'expiring'>
) {
  const { failures, expiring } = props;
  if (!failures.length && !expiring.length) return null;

  return (
    <View testID="eligibility-messages">
      {failures.map((result) => (
        <HelperText
          key={`${result.code}-${result.problem}`}
          testID={`eligibility-${result.bypassed ? 'warning' : 'failure'}-${result.code}`}
          type={result.bypassed ? 'info' : 'error'}
          visible
        >
          {result.message}
          {result.bypassed ? ' (you may let this through)' : ''}
        </HelperText>
      ))}
      {expiring.map((result) => (
        <HelperText
          key={`expiring-${result.code}`}
          testID={`eligibility-expiring-${result.code}`}
          type="info"
          visible
        >
          {`${result.code.replace(/_/g, ' ')} runs out soon`}
        </HelperText>
      ))}
    </View>
  );
}
