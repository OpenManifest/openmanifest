import * as React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';
import type { StatusKey } from '../../tokens';
import Button from '../Button';
import IconButton from '../IconButton';
import Text from '../Text';

export type ToastTone = 'info' | 'success' | 'error';

export type ToastProps = {
  message: string;
  tone?: ToastTone;
  /** One thing they can do about it (undo, retry) */
  action?: { label: string; onPress(): void };
  onDismiss?(): void;
  testID?: string;
};

const STATUS: Record<ToastTone, StatusKey> = { info: 'info', success: 'ok', error: 'blocked' };
const ICON: Record<ToastTone, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  info: 'information-outline',
  success: 'check-circle-outline',
  error: 'alert-circle-outline',
};

/**
 * A short message that goes away by itself (the host decides when; see the notifications provider). An error is an
 * alert, the rest are polite status messages. It has a dismiss button, and an action when there is something to undo.
 */
export default function Toast({ message, tone = 'info', action, onDismiss, testID }: ToastProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const status = STATUS[tone];
  const { bg, fg } = theme.colour.status[status];

  return (
    <View
      role={tone === 'error' ? 'alert' : 'status'}
      testID={testID}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space.sm,
        maxWidth: 560,
        paddingStart: theme.space.lg,
        paddingEnd: theme.space.xs,
        paddingVertical: theme.space.xs,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: fg,
        backgroundColor: bg,
        ...theme.elevation.overlay,
      }}
    >
      <MaterialCommunityIcons name={ICON[tone]} size={20} color={fg} />
      <View style={{ flexShrink: 1, flexGrow: 1, paddingVertical: theme.space.sm }}>
        <Text variant="bodyCompact" tone={status}>
          {message}
        </Text>
      </View>
      {action ? (
        <Button label={action.label} variant="tertiary" tone={status} onPress={action.onPress} />
      ) : null}
      {onDismiss ? (
        <IconButton
          icon="close"
          tone={status}
          aria-label={t('toast.dismiss')}
          onPress={onDismiss}
        />
      ) : null}
    </View>
  );
}
