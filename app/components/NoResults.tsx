import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { Text, useTheme } from 'app/ui';

interface INoResults extends ViewProps {
  title: string;
  subtitle: string;
}

/** What a list shows when it is empty: a heading and a line under it, centred in the space of the list */
export default function NoResults({ title, subtitle, style, ...rest }: INoResults) {
  const { space } = useTheme();

  return (
    <View
      {...rest}
      style={[
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          gap: space.xs,
          padding: space.lg,
        },
        style,
      ]}
    >
      <Text variant="title" role="heading" aria-level={2} align="center">
        {title}
      </Text>
      {subtitle ? (
        <Text tone="muted" align="center">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
