import * as React from 'react';
import { View } from 'react-native';
import { Divider, Tappable, Text, useTheme } from 'app/ui';

interface IInfoGrid {
  items: { title: string; value: string; onPress?(): void; bold?: boolean }[];
}

/** Facts of a load side by side (vehicle, crew, call): each a value over its name, some pressable */
export default function InfoGrid(props: IInfoGrid) {
  const { items } = props;
  const theme = useTheme();
  const flex = 1 / items.length;

  return (
    <>
      <Divider />
      <View style={{ width: '100%', flexDirection: 'row' }}>
        {items.map((item, i) => {
          const content = (
            <>
              <Text align="center" variant={item.bold !== false ? 'label' : 'body'}>
                {item.value}
              </Text>
              <Text align="center" variant="caption" tone="muted">
                {item.title}
              </Text>
            </>
          );
          const cell = {
            flex,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.space.lg,
            gap: theme.space.xs,
          } as const;
          return (
            <React.Fragment key={`info-grid-${i}`}>
              {item.onPress ? (
                <Tappable
                  role="button"
                  aria-label={`${item.title}: ${item.value}`}
                  onPress={item.onPress}
                  style={cell}
                >
                  {content}
                </Tappable>
              ) : (
                <View style={cell}>{content}</View>
              )}
              {i === items.length - 1 ? null : <Divider vertical />}
            </React.Fragment>
          );
        })}
      </View>
    </>
  );
}
