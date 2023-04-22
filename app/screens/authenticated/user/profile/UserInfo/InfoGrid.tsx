import * as React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Divider, List, useTheme } from 'react-native-paper';

interface IInfoGrid {
  items: { title: string; value: string; onPress?(): void; bold?: boolean }[];
  style?: ViewProps['style'];
}
export default function InfoGrid(props: IInfoGrid) {
  const { items, style } = props;
  const flex = 1 / items.length;
  const theme = useTheme();

  return (
    <>
      <Divider style={[styles.divider]} />
      <View style={StyleSheet.flatten([styles.container, style])}>
        {items.map((item, i) => (
          <>
            <View style={{ flex }} key={`info-grid-${i}`}>
              <List.Item
                titleStyle={[
                  styles.title,
                  {
                    alignSelf: 'center',
                    justifyContent: 'center',
                    color: theme.colors.text,
                    fontWeight: item.bold !== false ? 'bold' : undefined
                  }
                ]}
                style={{
                  paddingTop: 15
                }}
                title={item.value}
                descriptionStyle={[styles.description, { color: theme.colors.text }]}
                description={item.title}
                onPress={item.onPress}
              />
            </View>
            {i === items.length - 1 ? null : (
              <Divider key={`info-grid-divider-${i}`} style={[styles.verticalDivider]} />
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
    width: '100%'
  },
  verticalDivider: {
    width: StyleSheet.hairlineWidth,
    height: '100%'
  },
  title: {
    textAlign: 'center',
    color: 'white'
  },
  description: {
    textAlign: 'center',
    color: 'white'
  }
});
