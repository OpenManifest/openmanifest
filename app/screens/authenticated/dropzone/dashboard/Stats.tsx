import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

export interface IStatsProps {
  title?: string;
  data: { label: string; value: number | string; color?: string }[];
}
export default function Stats(props: IStatsProps) {
  const { title, data } = props;

  return (
    <Card>
      <Card.Title title={title} />
      <Card.Content style={styles.row}>
        {data?.map(({ label, color, value }, index) => (
          <>
            <View style={styles.statistic}>
              <View style={styles.value}>
                <Text style={[styles.valueText, { color }]}>{value}</Text>
              </View>
              <View style={styles.label}>
                <Text style={[styles.labelText, { color }]}>{label}</Text>
              </View>
            </View>
            {index === (data?.length || 0) - 1 ? null : <View style={styles.divider} />}
          </>
        ))}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statistic: {
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 8,
    marginHorizontal: 8,
  },
  divider: {
    height: '100%',
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#FAFAFA',
  },
  value: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  valueText: {
    fontSize: 16,
  },
});
