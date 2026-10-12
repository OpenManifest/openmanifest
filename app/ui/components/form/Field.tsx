import * as React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';
import Text from '../Text';

export type FieldMessages = {
  /** Shown under the field; replaced by `error` when there is one */
  helperText?: string | null;
  /** The validation message: announced to screen readers when it appears */
  error?: string | null;
};

/** Ids that tie a field to its label and its message, for `aria-labelledby` and `aria-describedby` */
export function useFieldIds() {
  const id = React.useId();
  return { labelId: `${id}-label`, messageId: `${id}-message` };
}

/** What a screen reader needs on the input of a field: the name, the description and the invalid state */
export function fieldAria(
  { labelId, messageId }: ReturnType<typeof useFieldIds>,
  { helperText, error }: FieldMessages
) {
  return {
    'aria-labelledby': labelId,
    'aria-describedby': error || helperText ? messageId : undefined,
    'aria-invalid': !!error,
  } as const;
}

type FieldProps = FieldMessages & {
  label: string;
  ids: ReturnType<typeof useFieldIds>;
  /** The control; it names itself with `fieldAria` */
  children: React.ReactNode;
};

/** The label above a control and the helper or error text under it */
export default function Field({ label, ids, helperText, error, children }: FieldProps) {
  const { space } = useTheme();
  const message = error || helperText;

  return (
    <View style={{ gap: space.xs }}>
      <Text variant="label" tone="muted" nativeID={ids.labelId}>
        {label}
      </Text>
      {children}
      {message ? (
        <Text
          variant="caption"
          tone={error ? 'blocked' : 'muted'}
          nativeID={ids.messageId}
          // A new error is read out without moving focus
          role={error ? 'alert' : undefined}
          aria-live={error ? 'polite' : undefined}
          accessibilityLiveRegion={error ? 'polite' : undefined}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}
