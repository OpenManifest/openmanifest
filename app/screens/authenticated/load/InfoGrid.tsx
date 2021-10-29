import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, List } from 'react-native-paper';

interface IInfoGrid {
  items: { title: string; value: string; onPress?(): void; bold?: boolean }[];
}
export default function InfoGrid(props: IInfoGrid) {
  const { items } = props;
  const flex = 1 / items.length;

  return (
    <>
      <Divider style={styles.divider} />
      <View style={styles.container}>
        {items.map((item, i) => (
          <>
            <View
              style={{ flex }}
              // eslint-disable-next-line react/no-array-index-key
              key={`info-grid-${i}`}
            >
              <List.Item
                titleStyle={[
                  styles.title,
                  {
                    fontWeight: item.bold !== false ? 'bold' : undefined,
                  },
                ]}
                style={{
                  paddingVertical: 20,
                }}
                title={item.value}
                descriptionStyle={styles.description}
                description={item.title}
                onPress={item.onPress}
              />
            </View>
            {i === items.length - 1 ? null : (
              // eslint-disable-next-line react/no-array-index-key
              <Divider key={`info-grid-divider-${i}`} style={styles.verticalDivider} />
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
  },
  verticalDivider: {
    width: StyleSheet.hairlineWidth,
    height: '100%',
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
});