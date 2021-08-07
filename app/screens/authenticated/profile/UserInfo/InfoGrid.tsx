import * as React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Divider, List, useTheme } from 'react-native-paper';

interface IInfoGrid {
  items: { title: string; value: string; onPress?(): void; bold?: boolean }[];
  variant?: 'dark' | 'light';
  style?: ViewProps['style'];
}
export default function InfoGrid(props: IInfoGrid) {
  const { items, style, variant } = props;
  const flex = 1 / items.length;
  const theme = useTheme();

  const color = variant === 'light' ? theme.colors.surface : theme.colors.text;

  return (
    <>
      <Divider style={[styles.divider, { backgroundColor: color }]} />
      <View style={StyleSheet.flatten([styles.container, style])}>
        {items.map((item, i) => (
          <>
            {/* eslint-disable-next-line react/no-array-index-key */}
            <View style={{ flex }} key={`info-grid-${i}`}>
              <List.Item
                titleStyle={[
                  styles.title,
                  {
                    color,
                    fontWeight: item.bold !== false ? 'bold' : undefined,
                  },
                ]}
                title={item.value}
                descriptionStyle={[styles.description, { color }]}
                description={item.title}
                onPress={item.onPress}
              />
            </View>
            {i === items.length - 1 ? null : (
              /* eslint-disable-next-line react/no-array-index-key */
              <Divider
                key={`info-grid-divider-${i}`}
                style={[styles.verticalDivider, { backgroundColor: color }]}
              />
            )}
          </>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', flexDirection: 'row' },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    backgroundColor: 'white',
  },
  verticalDivider: {
    width: StyleSheet.hairlineWidth,
    height: '100%',
    backgroundColor: 'white',
  },
  title: {
    textAlign: 'center',
    color: 'white',
  },
  description: {
    textAlign: 'center',
    color: 'white',
  },
});
