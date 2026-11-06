import * as React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import type { StatusKey } from '../../tokens';
import Text from '../Text';

export type StatusBadgeProps = {
  status: StatusKey;
  /** The word: a status is never colour alone, so there is always one */
  label: string;
  /** Replaces the icon of the status */
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  testID?: string;
};

const ICON: Record<StatusKey, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  open: 'door-open',
  boarding: 'bullhorn-outline',
  departed: 'airplane-takeoff',
  landed: 'airplane-landing',
  cancelled: 'cancel',
  warning: 'alert-outline',
  blocked: 'alert-octagon-outline',
  ok: 'check-circle-outline',
  info: 'information-outline',
};

/** A status as colour, icon and word together, in a pill: the colours come from the status tokens */
export default function StatusBadge({ status, label, icon, testID }: StatusBadgeProps) {
  const theme = useTheme();
  const { bg, fg } = theme.colour.status[status];

  return (
    <View
      testID={testID}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: theme.space.xs,
        paddingHorizontal: theme.space.sm,
        paddingVertical: theme.space.xs,
        borderRadius: theme.radius.pill,
        backgroundColor: bg,
      }}
    >
      <MaterialCommunityIcons name={icon ?? ICON[status]} size={14} color={fg} />
      <Text variant="label" tone={status} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
