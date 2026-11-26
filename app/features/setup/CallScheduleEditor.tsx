import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Chip, NumberField, Row, Text, useTheme } from 'app/ui';
import { MAX_CALLS, addCall, callProblem, removeCall } from './rules';

export type CallScheduleEditorProps = {
  /** Minutes before departure, longest first */
  value: number[];
  onChange(value: number[]): void;
  disabled?: boolean;
  testID?: string;
};

/**
 * The boarding calls of the operator: one chip per call, longest first, each with its remove button, and a field to add
 * one. At most six; none means a load departs without a call.
 */
export default function CallScheduleEditor({
  value,
  onChange,
  disabled = false,
  testID = 'call-schedule',
}: CallScheduleEditorProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const [minutes, setMinutes] = React.useState<number | null>(null);
  const [touched, setTouched] = React.useState(false);
  const problem = callProblem(value, minutes);
  const full = value.length >= MAX_CALLS;

  const add = () => {
    setTouched(true);
    if (problem) return;
    onChange(addCall(value, minutes));
    setMinutes(null);
    setTouched(false);
  };

  return (
    <View style={{ gap: theme.space.sm }} testID={testID}>
      {value.length ? (
        <Row gap="sm" wrap testID={`${testID}-calls`}>
          {value.map((call) => (
            <Chip
              key={call}
              variant="input"
              label={t('rules.callAt', { count: call })}
              removeLabel={t('rules.removeCall', { count: call })}
              disabled={disabled}
              onRemove={() => onChange(removeCall(value, call))}
              testID={`${testID}-call-${call}`}
            />
          ))}
        </Row>
      ) : (
        <Text tone="muted" testID={`${testID}-none`}>
          {t('rules.noCalls')}
        </Text>
      )}
      {full ? (
        <Text variant="caption" tone="muted">
          {t('rules.callsFull', { count: MAX_CALLS })}
        </Text>
      ) : (
        <Row gap="sm" align="end">
          <View style={{ flex: 1 }}>
            <NumberField
              label={t('rules.newCall')}
              value={minutes}
              onChange={(next) => {
                setMinutes(next);
                setTouched(false);
              }}
              min={1}
              unit={t('rules.minutesUnit')}
              hideSteppers
              disabled={disabled}
              error={touched && problem ? t(`rules.callProblem.${problem}`) : undefined}
              testID={`${testID}-minutes`}
            />
          </View>
          <Button
            label={t('rules.addCall')}
            variant="secondary"
            icon="plus"
            disabled={disabled}
            onPress={add}
            testID={`${testID}-add`}
          />
        </Row>
      )}
    </View>
  );
}
