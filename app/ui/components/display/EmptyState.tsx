import * as React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import Button from '../Button';
import Text from '../Text';

export type EmptyStateProps = {
  title: string;
  /** What it means, or what to do */
  body?: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  /** The next step */
  action?: { label: string; onPress(): void };
  testID?: string;
};

/**
 * What a screen shows when there is nothing to show (no loads yet, no access, a failed request): a heading that says what
 * is the case, a line on why or what next, and the one action that gets out of it.
 */
export default function EmptyState({ title, body, icon, action, testID }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.space.sm,
        padding: theme.space.xl,
      }}
    >
      {icon ? (
        <MaterialCommunityIcons name={icon} size={40} color={theme.colour.textMuted} />
      ) : null}
      <Text variant="title" role="heading" aria-level={2} align="center" testID={testID}>
        {title}
      </Text>
      {body ? (
        <Text tone="muted" align="center">
          {body}
        </Text>
      ) : null}
      {action ? (
        <View style={{ paddingTop: theme.space.md }}>
          <Button label={action.label} onPress={action.onPress} />
        </View>
      ) : null}
    </View>
  );
}
