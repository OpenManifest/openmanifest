import * as React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';
import type { StatusKey } from '../../tokens';
import Button from '../Button';
import IconButton from '../IconButton';
import Text from '../Text';

export type BannerTone = 'info' | 'warning' | 'blocked';

export type BannerProps = {
  tone?: BannerTone;
  /** What the person needs to know */
  message: string;
  /** One thing they can do about it */
  action?: { label: string; onPress(): void };
  /** Shows a dismiss button */
  onDismiss?(): void;
  testID?: string;
};

const ICON: Record<BannerTone, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  info: 'information-outline',
  warning: 'alert-outline',
  blocked: 'alert-octagon-outline',
};

/**
 * A notice in the page, under a header or above a form, in the colours of a status. A blocked notice is an alert (read
 * out at once); info and warning are status messages (read out when the reader is free). The icon says it too, so the
 * colour is never the only signal.
 */
export default function Banner({ tone = 'info', message, action, onDismiss, testID }: BannerProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const status: StatusKey = tone;
  const { bg, fg } = theme.colour.status[status];

  return (
    <View
      role={tone === 'blocked' ? 'alert' : 'status'}
      testID={testID}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space.sm,
        paddingHorizontal: theme.space.lg,
        paddingVertical: theme.space.sm,
        backgroundColor: bg,
      }}
    >
      <MaterialCommunityIcons name={ICON[tone]} size={20} color={fg} />
      <View style={{ flexGrow: 1, flexShrink: 1 }}>
        <Text variant="bodyCompact" tone={status}>
          {message}
        </Text>
      </View>
      {action ? (
        <Button
          label={action.label}
          variant="tertiary"
          tone={status}
          onPress={action.onPress}
          testID={testID ? `${testID}-action` : undefined}
        />
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
