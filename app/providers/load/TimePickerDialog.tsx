import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Overlay, Row, TimeField } from 'app/ui';
import { useOperatorTimeZone } from 'app/hooks/useOperatorToday';

export interface ITimePickerDialog {
  open: boolean;
  onChange(time: number): void;
  onClose(): void;
}

/** The dispatch time of a load (the classic load screen): a time of day on the operator's clock */
export function TimePickerDialog(props: ITimePickerDialog) {
  const { open, onClose, onChange } = props;
  const timeZone = useOperatorTimeZone();
  const { t } = useTranslation(['common', 'terms']);
  const [time, setTime] = React.useState<number>();

  return (
    <Overlay
      open={open}
      onClose={onClose}
      presentation="dialog"
      title={t('common:legacy.dispatch.title', { vehicle: t('terms:vehicle', { count: 1 }) })}
      footer={
        <Row gap="sm" justify="end">
          <Button variant="secondary" label={t('common:legacy.cancel')} onPress={onClose} />
          <Button
            label={t('common:legacy.dispatch.submit')}
            disabled={!time}
            onPress={() => time && onChange(time)}
          />
        </Row>
      }
    >
      <TimeField
        label={t('common:legacy.dispatch.time')}
        value={time}
        onChange={setTime}
        timeZone={timeZone}
      />
    </Overlay>
  );
}
