import React from 'react';
import { useTranslation } from 'react-i18next';
import { Cell, CellText, TableRow } from './Grid';

export interface IAvailableRowProps {
  index: number;
  onPress(): void;
}
export default function AvailableRow(props: IAvailableRowProps) {
  const { onPress } = props;
  const { t } = useTranslation('common');

  return (
    <TableRow testID="slot-row" label={t('legacy.slotsTable.available')} {...{ onPress }}>
      <Cell style={{ flexGrow: 10 }}>
        <CellText>{t('legacy.slotsTable.available')}</CellText>
      </Cell>
    </TableRow>
  );
}
