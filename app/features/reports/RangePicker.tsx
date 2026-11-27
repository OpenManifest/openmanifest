import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Segmented } from 'app/ui';
import { RANGES, type RangeKey } from './reports';

export type RangePickerProps = {
  value: RangeKey;
  onChange(range: RangeKey): void;
};

/** The period the report covers: all time or the last months */
export default function RangePicker({ value, onChange }: RangePickerProps) {
  const { t } = useTranslation('common');

  return (
    <Segmented<RangeKey>
      testID="reports-range"
      label={t('reports.range.label')}
      value={value}
      onChange={onChange}
      options={RANGES.map((range) => ({ value: range, label: t(`reports.range.${range}`) }))}
    />
  );
}
