import * as React from 'react';
import Text from '../Text';

export type FieldErrorProps = {
  /** The validation message; nothing is shown (and nothing announced) when it is empty */
  children?: string | null;
  testID?: string;
};

/**
 * A validation message under a control that has none of its own (a card select, a date picker): in the blocked colour,
 * announced to screen readers when it appears.
 */
export default function FieldError({ children, testID }: FieldErrorProps) {
  if (!children) return null;

  return (
    <Text
      variant="caption"
      tone="blocked"
      role="alert"
      aria-live="polite"
      accessibilityLiveRegion="polite"
      testID={testID}
    >
      {children}
    </Text>
  );
}
