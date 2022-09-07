import * as React from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Card, Text } from 'react-native-paper';

export interface IStatsProps {
  title?: string;
  columns?: number;
  data: { label: string; value: number | string; color?: string }[];
}
export default function Stats(props: IStatsProps) {
  const { title, data, columns: cols } = props;
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  const onLayout = React.useCallback((event: LayoutChangeEvent) => {
    setDimensions(event.nativeEvent.layout);
    console.debug(event.nativeEvent.layout);
  }, []);

  const columns = React.useMemo(() => cols || data?.length || 1, [cols, data?.length]);

  const itemWidth = React.useMemo(() => {
    if (columns) {
      return Math.floor((dimensions.width - 32) / columns);
    }
    return 50;
  }, [columns, dimensions.width]);

  const cardHeight = React.useMemo(
    () => Math.ceil((data?.length || 1) / columns) * 120,
    [columns, data?.length]
  );
  return (
    <Card style={[styles.card, { height: cardHeight }]} {...{ onLayout }}>
      <Card.Title title={title} />
      <Card.Content style={styles.row}>
        {data?.map(({ label, color, value }, index) => (
          <View style={{ flexDirection: 'row', width: itemWidth, height: 70 }}>
            <View style={styles.statistic}>
              <View style={styles.value}>
                <Text style={[styles.valueText, { color }]}>{value}</Text>
              </View>
              <View style={styles.label}>
                <Text
                  style={[styles.labelText, { color }]}
                  lineBreakMode="middle"
                  numberOfLines={2}
                >
                  {label}
                </Text>
              </View>
            </View>
            {index === (data?.length || 0) - 1 ? null : <View style={styles.divider} />}
          </View>
        ))}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, marginVertical: 4, maxWidth: '100%', justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexWrap: 'wrap',
    width: '100%',
  },
  statistic: {
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
    // width: 50,
    // padding: 8,
    // marginHorizontal: 8,
  },
  divider: {
    height: '100%',
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#FAFAFA',
  },
  value: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  label: {
    flex: 1,
    alignItems: 'center',
    marginTop: 4,
    justifyContent: 'flex-start',
  },
  labelText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  valueText: {
    fontSize: 16,
  },
});
