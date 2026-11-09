import { StyleSheet } from 'react-native';
import React from 'react';
import { DataTable, Paragraph } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

export interface IAvailableRowProps {
  index: number;
  onPress(): void;
}
export default function AvailableRow(props: IAvailableRowProps) {
  const { onPress } = props;
  const { t } = useTranslation('common');

  return (
    <DataTable.Row testID="slot-row" {...{ onPress }}>
      <DataTable.Cell style={{ flexGrow: 10 }}>
        <Paragraph style={styles.slotText}>{t('legacy.slotsTable.available')}</Paragraph>
      </DataTable.Cell>
    </DataTable.Row>
  );
}

const styles = StyleSheet.create({
  slotText: {
    fontSize: 12,
  },
});
