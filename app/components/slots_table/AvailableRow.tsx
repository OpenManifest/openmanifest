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
      <DataTable.Cell style={{ flexGrow: 10 }}>
        <Paragraph style={styles.slotText}>- Available -</Paragraph>
      </DataTable.Cell>
    </DataTable.Row>
  );
}

const styles = StyleSheet.create({
  slotText: {
    fontSize: 12,
  },
});
