import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, IconButton, NumberField, Overlay, Row, Text, useTheme } from 'app/ui';
import { useReloadWeatherMutation, useSaveConditionsMutation } from 'app/api/reflection';
import type { WeatherConditionEssentialsFragment } from 'app/api/operations';
import { useOperatorFormat } from 'app/i18n/operatorFormat';
import { UNIT_SYMBOLS, unitOf } from 'app/i18n/units';
import { useNotifications } from 'app/providers/notifications';
import {
  HEADING_MAX,
  MAX_WINDS,
  draftOf,
  emptyWind,
  inputOf,
  problemsOf,
  type ConditionsDraft,
  type WindDraft,
} from './conditions';

export type ConditionsPanelProps = {
  open: boolean;
  onClose(): void;
  /** The conditions of the day (`operator.currentConditions`) */
  conditions?: Pick<
    WeatherConditionEssentialsFragment,
    'id' | 'winds' | 'jumpRun' | 'temperatureC'
  > | null;
  operatorId?: string | null;
  /** The operator has a location, so the winds can be fetched from the winds-aloft feed */
  canFetch?: boolean;
  testID?: string;
};

/**
 * Changes the conditions of the day: the temperature on the ground, the heading of the jump run (0–359°) and the winds
 * aloft, a row for each height, in the operator's units. A side panel on a wide window, a sheet on a phone.
 */
export default function ConditionsPanel({
  open,
  onClose,
  conditions,
  operatorId,
  canFetch = false,
  testID = 'conditions-panel',
}: ConditionsPanelProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const notify = useNotifications();
  const units = useOperatorFormat((state) => state.units);
  const [draft, setDraft] = React.useState<ConditionsDraft>(() => draftOf(conditions, units));
  const [touched, setTouched] = React.useState(false);
  const [save, { loading: saving }] = useSaveConditionsMutation();
  const [reload, { loading: fetching }] = useReloadWeatherMutation();

  // Each time it opens it starts from the conditions as they are now
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setDraft(draftOf(conditions, units));
      setTouched(false);
    }
  }

  const problems = problemsOf(draft);
  const problem = (key: string) =>
    touched && problems[key]
      ? t(`conditions.problem.${problems[key]}`, { max: HEADING_MAX })
      : undefined;
  const unit = (quantity: 'altitude' | 'speed' | 'temperature') =>
    UNIT_SYMBOLS[unitOf(quantity, units)];

  const updateWind = (index: number, patch: Partial<WindDraft>) =>
    setDraft((current) => ({
      ...current,
      winds: current.winds.map((wind, at) => (at === index ? { ...wind, ...patch } : wind)),
    }));

  const onSave = async () => {
    setTouched(true);
    if (Object.keys(problemsOf(draft)).length || !conditions?.id) return;
    try {
      const { data } = await save({
        variables: {
          id: Number(conditions.id),
          operatorId: Number(operatorId),
          ...inputOf(draft, units),
        },
      });
      const payload = data?.createWeatherCondition;
      const errors = payload?.errors ?? [];
      if (errors.length || !payload?.weatherCondition) {
        notify.error(errors[0] ?? t('conditions.notSaved'));
        return;
      }
      notify.success(t('conditions.saved'));
      onClose();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t('conditions.notSaved'));
    }
  };

  const onFetch = async () => {
    if (!conditions?.id) return;
    try {
      const { data } = await reload({ variables: { id: Number(conditions.id) } });
      const payload = data?.reloadWeatherCondition;
      if (payload?.errors?.length || !payload?.weatherCondition) {
        notify.error(payload?.errors?.[0] ?? t('conditions.notFetched'));
        return;
      }
      setDraft(draftOf(payload.weatherCondition, units));
      setTouched(false);
      notify.success(t('conditions.fetched'));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t('conditions.notFetched'));
    }
  };

  return (
    <Overlay
      open={open}
      onClose={onClose}
      title={t('conditions.title')}
      testID={testID}
      footer={
        <Row gap="sm" justify="end" wrap>
          {canFetch ? (
            <Button
              variant="secondary"
              icon="cloud-download-outline"
              label={t('conditions.fetch')}
              loading={fetching}
              disabled={saving || fetching}
              onPress={onFetch}
              testID={`${testID}-fetch`}
            />
          ) : null}
          <Button
            label={t('conditions.save')}
            loading={saving}
            disabled={saving || fetching}
            onPress={onSave}
            testID={`${testID}-save`}
          />
        </Row>
      }
    >
      <View style={{ gap: theme.space.lg }}>
        <Row gap="md">
          <View style={{ flex: 1, minWidth: 0 }}>
            <NumberField
              label={t('conditions.temperature')}
              value={draft.temperature}
              onChange={(temperature) => setDraft((current) => ({ ...current, temperature }))}
              unit={unit('temperature')}
              hideSteppers
              error={problem('temperature')}
              testID={`${testID}-temperature`}
            />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <NumberField
              label={t('conditions.jumpRun')}
              value={draft.jumpRun}
              onChange={(jumpRun) => setDraft((current) => ({ ...current, jumpRun }))}
              min={0}
              max={HEADING_MAX}
              step={5}
              unit="°"
              hideSteppers
              error={problem('jumpRun')}
              testID={`${testID}-jump-run`}
            />
          </View>
        </Row>

        <View style={{ gap: theme.space.sm }}>
          <Text variant="label" role="heading" aria-level={3}>
            {t('conditions.winds')}
          </Text>
          {draft.winds.length ? null : (
            <Text tone="muted" testID={`${testID}-no-winds`}>
              {t('conditions.noWinds')}
            </Text>
          )}
          {draft.winds.map((wind, index) => {
            const number = index + 1;
            return (
              <View
                // Rows are added at the end and removed by position: the index is the identity
                key={index}
                role="group"
                aria-label={t('conditions.wind', { number })}
                testID={`${testID}-wind-${index}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: theme.space.sm,
                  paddingTop: theme.space.sm,
                  borderTopWidth: 1,
                  borderTopColor: theme.colour.border,
                }}
              >
                <View style={{ flex: 1, flexDirection: 'row', gap: theme.space.sm }}>
                  {/* A height has the most digits: it takes the larger share of a narrow row */}
                  <View style={{ flex: 4, minWidth: 0 }}>
                    <NumberField
                      label={t('conditions.altitude', { number })}
                      value={wind.altitude}
                      onChange={(altitude) => updateWind(index, { altitude })}
                      min={0}
                      unit={unit('altitude')}
                      hideSteppers
                      error={problem(`winds.${index}.altitude`)}
                      testID={`${testID}-wind-${index}-altitude`}
                    />
                  </View>
                  <View style={{ flex: 3, minWidth: 0 }}>
                    <NumberField
                      label={t('conditions.speed', { number })}
                      value={wind.speed}
                      onChange={(speed) => updateWind(index, { speed })}
                      min={0}
                      unit={unit('speed')}
                      hideSteppers
                      error={problem(`winds.${index}.speed`)}
                      testID={`${testID}-wind-${index}-speed`}
                    />
                  </View>
                  <View style={{ flex: 3, minWidth: 0 }}>
                    <NumberField
                      label={t('conditions.direction', { number })}
                      value={wind.direction}
                      onChange={(direction) => updateWind(index, { direction })}
                      min={0}
                      max={HEADING_MAX}
                      unit="°"
                      hideSteppers
                      error={problem(`winds.${index}.direction`)}
                      testID={`${testID}-wind-${index}-direction`}
                    />
                  </View>
                </View>
                <IconButton
                  icon="delete-outline"
                  aria-label={t('conditions.removeWind', { number })}
                  onPress={() =>
                    setDraft((current) => ({
                      ...current,
                      winds: current.winds.filter((_, at) => at !== index),
                    }))
                  }
                  testID={`${testID}-wind-${index}-remove`}
                />
              </View>
            );
          })}
          {draft.winds.length < MAX_WINDS ? (
            <Button
              variant="tertiary"
              icon="plus"
              label={t('conditions.addWind')}
              onPress={() =>
                setDraft((current) => ({ ...current, winds: [...current.winds, emptyWind()] }))
              }
              testID={`${testID}-add-wind`}
            />
          ) : (
            <Text variant="caption" tone="muted">
              {t('conditions.windsFull', { count: MAX_WINDS })}
            </Text>
          )}
          {canFetch ? (
            <Text variant="caption" tone="muted">
              {t('conditions.feed')}
            </Text>
          ) : null}
        </View>
      </View>
    </Overlay>
  );
}
