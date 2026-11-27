import * as React from 'react';
import { View } from 'react-native';
import { Icon, Text, useTheme } from 'app/ui';
import PressableCard from './PressableCard';

interface ISetupStepCard {
  completed?: boolean;
  index?: number;
  title: string;
  description?: string;
  onPress(): void;
}

/** A step of setting up the operator: its number (a check once done), what it is, and a chevron to open it */
export function SetupStepCard(props: ISetupStepCard) {
  const { completed, index, title, description, onPress } = props;
  const theme = useTheme();
  return (
    <PressableCard
      label={title}
      onPress={onPress}
      disabled={completed}
      style={{
        marginHorizontal: theme.space.lg,
        marginVertical: theme.space.lg,
        padding: theme.space.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space.md,
        opacity: completed ? 0.7 : 1,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: theme.radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colour.brand,
        }}
      >
        {completed ? (
          <Icon name="check" tone="onBrand" />
        ) : (
          <Text variant="label" tone="onBrand">{`${index}`}</Text>
        )}
      </View>
      <View style={{ flex: 1, gap: theme.space.xs }}>
        <Text variant="label">{title}</Text>
        {description ? <Text tone="muted">{description}</Text> : null}
      </View>
      <Icon name="chevron-right" tone="muted" />
    </PressableCard>
  );
}
