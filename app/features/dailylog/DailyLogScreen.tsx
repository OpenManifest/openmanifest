import * as React from 'react';
import { Linking, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import FormColumn, { FORM_COLUMN_WIDE_MAX_WIDTH } from 'app/components/layout/FormColumn';
import DatePicker from 'app/components/input/date_picker/DatePicker';
import { useDailyLogQuery, useMembershipsQuery } from 'app/api/reflection';
import { Permission } from 'app/api/schema.d';
import { formatQuantity } from 'app/i18n/format';
import useTerms from 'app/i18n/useTerms';
import { useOperatorContext } from 'app/providers/operator/context';
import {
  Button,
  Divider,
  EmptyState,
  FormSelect,
  FormTextField,
  IconButton,
  ListRow,
  Row,
  Skeleton,
  Text,
  useTheme,
} from 'app/ui';
import Section, { Fact } from 'app/features/profile/Section';
import { clampToToday, dayTitle, isoDayOf, secondsOf } from './dailyLog';
import useDailyLogForm from './useDailyLogForm';

/**
 * The daily log (Setup → Daily log): a day's duty officer and notes, which staff change here, and every load of the
 * day with its crew, vehicle and who was on it. The day's log downloads as a file.
 */
export default function DailyLogScreen() {
  const { t } = useTranslation('common');
  const term = useTerms();
  const theme = useTheme();
  const {
    operator: { operator },
  } = useOperatorContext();
  const operatorId = operator?.id ? String(operator.id) : '';
  const [date, setDate] = React.useState(() => DateTime.local().toISODate() as string);
  const [editing, setEditing] = React.useState(false);

  const { data, loading, refetch } = useDailyLogQuery({
    variables: { operatorId, date },
    skip: !operatorId,
  });
  const entry = data?.dailyLog;
  const { data: officers } = useMembershipsQuery({
    variables: { operatorId, permissions: [Permission.ActAsDutyOfficer] },
    skip: !operatorId || !editing,
  });
  const { form, dirty, saving, save, discard } = useDailyLogForm({
    operatorId,
    date,
    entry,
    onSaved: () => {
      setEditing(false);
      refetch();
    },
  });
  const { control } = form;
  const words = { load: term('load'), loads: term('load', 2).toLowerCase() };
  const officerOptions = (officers?.memberships?.edges ?? [])
    .map((edge) => edge?.node)
    .filter(Boolean)
    .map((node) => ({ value: String(node?.id), label: node?.user?.name ?? '' }));

  const onDownload = () => {
    if (entry?.downloadUrl) Linking.openURL(entry.downloadUrl);
  };

  return (
    <ScreenContainer edges={['bottom']} testID="daily-log">
      <FormColumn
        maxWidth={FORM_COLUMN_WIDE_MAX_WIDTH}
        contentContainerStyle={{ paddingTop: theme.space.lg, gap: theme.space.lg }}
      >
        <Row gap="sm" align="center">
          <View style={{ flex: 1 }}>
            <DatePicker
              label={t('dailyLog.day')}
              value={secondsOf(date)}
              onChange={(seconds) => {
                setEditing(false);
                setDate(clampToToday(isoDayOf(seconds)));
              }}
            />
          </View>
          <IconButton
            icon="download"
            aria-label={t('dailyLog.download')}
            testID="daily-log-download"
            disabled={!entry?.downloadUrl}
            onPress={onDownload}
          />
        </Row>

        <Section
          title={dayTitle(date)}
          testID="daily-log-day"
          action={
            editing ? null : (
              <Button
                variant="secondary"
                icon="pencil"
                label={t('dailyLog.edit')}
                testID="daily-log-edit"
                onPress={() => setEditing(true)}
              />
            )
          }
        >
          {loading && !entry ? <Skeleton lines={2} /> : null}
          {editing ? (
            <>
              <FormSelect
                control={control}
                name="dutyOfficerId"
                testID="daily-log-duty-officer"
                label={t('dailyLog.dutyOfficer')}
                placeholder={t('dailyLog.choose')}
                options={officerOptions}
              />
              <FormTextField
                control={control}
                name="notes"
                testID="daily-log-notes"
                label={t('dailyLog.notes')}
                placeholder={t('dailyLog.notesPlaceholder')}
                multiline
              />
              <Row gap="sm" justify="end" wrap>
                <Button
                  variant="tertiary"
                  label={t('dailyLog.cancel')}
                  disabled={saving}
                  onPress={() => {
                    discard();
                    setEditing(false);
                  }}
                />
                <Button
                  icon="check"
                  label={t('dailyLog.save')}
                  testID="daily-log-save-primary-action"
                  loading={saving}
                  disabled={!dirty}
                  onPress={save}
                />
              </Row>
            </>
          ) : (
            <>
              <Fact
                label={t('dailyLog.dutyOfficer')}
                value={entry?.dutyOfficer?.name || t('dailyLog.nobody')}
                testID="daily-log-duty-officer"
              />
              <Text variant="label" tone="muted">
                {t('dailyLog.notes')}
              </Text>
              <Text testID="daily-log-notes">{entry?.notes || t('dailyLog.noNotes')}</Text>
            </>
          )}
        </Section>

        {!loading && !entry?.loads?.length ? (
          <EmptyState
            testID="daily-log-empty"
            icon="calendar-blank-outline"
            title={t('dailyLog.noLoads', words)}
          />
        ) : null}
        {entry?.loads?.map((load) => (
          <Section
            key={load.id}
            title={t('loadNumber', { load: term('load'), number: load.loadNumber })}
            testID={`daily-log-load-${load.id}`}
            list
          >
            <View style={{ paddingHorizontal: theme.space.lg, gap: theme.space.xs }}>
              <Fact label={t('dailyLog.pilot')} value={load.pilot?.name || t('dailyLog.nobody')} />
              <Fact label={t('dailyLog.gca')} value={load.gca?.name || t('dailyLog.nobody')} />
              <Fact
                label={term('vehicle')}
                value={
                  load.vehicle
                    ? [load.vehicle.name, load.vehicle.registration].filter(Boolean).join(' ')
                    : t('dailyLog.noVehicle', { vehicle: term('vehicle').toLowerCase() })
                }
              />
            </View>
            <Divider />
            {load.slots?.length ? (
              load.slots.map((slot) => (
                <ListRow
                  key={slot.id}
                  testID={`daily-log-slot-${slot.id}`}
                  title={slot.name || ''}
                  supporting={slot.activityType || undefined}
                  trailing={<Text tone="muted">{formatQuantity(slot.altitudeM, 'altitude')}</Text>}
                />
              ))
            ) : (
              <View style={{ paddingHorizontal: theme.space.lg }}>
                <Text tone="muted">{t('dailyLog.nobodyOn', words)}</Text>
              </View>
            )}
          </Section>
        ))}
      </FormColumn>
    </ScreenContainer>
  );
}
