import { StyleSheet } from 'react-native';
import React from 'react';
import { DataTable, Paragraph } from 'react-native-paper';

export interface IAvailableRowProps {
  onPress(): void;
}
export default function AvailableRow(props: IAvailableRowProps) {
  const { onPress } = props;

  return (
    <DataTable.Row testID="slot-row" {...{ onPress }}>
      <DataTable.Cell>
        <Paragraph style={styles.slotText}>- Available -</Paragraph>
      </DataTable.Cell>
      <DataTable.Cell numeric>-</DataTable.Cell>
      <DataTable.Cell numeric>-</DataTable.Cell>
    </DataTable.Row>
  );
}

const styles = StyleSheet.create({
  slotText: {
    fontSize: 12,
  },
});
