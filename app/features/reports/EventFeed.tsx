import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { uniqBy } from 'lodash';
import { useActivityDetailsQuery } from 'app/api/reflection';
import type { ActivityEssentialsFragment } from 'app/api/operations';
import { EventAccessLevel, EventLevel, Permission, type TimeRangeInput } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { formatDateTime } from 'app/i18n/format';
import { Avatar, Button, Chip, EmptyState, ListRow, Row, Skeleton, Text, useTheme } from 'app/ui';
import Section from 'app/features/profile/Section';
import { toggled } from './reports';

export type EventFeedProps = {
  operatorId?: string | null;
  timeRange?: TimeRangeInput;
  timeZone?: string | null;
};

const LEVEL_TONE = {
  [EventLevel.Info]: 'info',
  [EventLevel.Debug]: 'muted',
  [EventLevel.Error]: 'blocked',
} as const;

/**
 * What happened at the operator, newest first: who did what and when. Those who may see admin or system events choose
 * which kinds to show; the details of an event open under it.
 */
export default function EventFeed({ operatorId, timeRange, timeZone }: EventFeedProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const canAdmin = useRestriction(Permission.ViewAdminActivity);
  const canSystem = useRestriction(Permission.ViewSystemActivity);
  const canUser = useRestriction(Permission.ViewUserActivity);

  const accessChoices = [
    canAdmin && EventAccessLevel.Admin,
    canUser && EventAccessLevel.User,
    canSystem && EventAccessLevel.System,
  ].filter(Boolean) as EventAccessLevel[];
  const levelChoices = [
    canUser && EventLevel.Info,
    canSystem && EventLevel.Debug,
    canAdmin && EventLevel.Error,
  ].filter(Boolean) as EventLevel[];

  const [accessLevels, setAccessLevels] = React.useState<EventAccessLevel[]>(
    () =>
      [
        EventAccessLevel.User,
        canAdmin && EventAccessLevel.Admin,
        canSystem && EventAccessLevel.System,
      ].filter(Boolean) as EventAccessLevel[]
  );
  const [levels, setLevels] = React.useState<EventLevel[]>(
    () =>
      [EventLevel.Info, canSystem && EventLevel.Debug, canSystem && EventLevel.Error].filter(
        Boolean
      ) as EventLevel[]
  );
  const [open, setOpen] = React.useState<string>();

  const { data, loading, fetchMore } = useActivityDetailsQuery({
    variables: { operator: operatorId ? [operatorId] : undefined, accessLevels, levels, timeRange },
    skip: !operatorId,
  });
  const events = (data?.activity?.edges ?? [])
    .map((edge) => edge?.node)
    .filter((node): node is ActivityEssentialsFragment & { id: string } => !!node);
  const pageInfo = data?.activity?.pageInfo;

  const onMore = React.useCallback(() => {
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;
    fetchMore({
      variables: { after: pageInfo.endCursor },
      updateQuery: (previous, { fetchMoreResult }) => ({
        ...previous,
        activity: {
          ...previous.activity,
          pageInfo: fetchMoreResult.activity.pageInfo,
          edges: uniqBy(
            [...(previous.activity.edges ?? []), ...(fetchMoreResult.activity.edges ?? [])],
            (edge) => edge?.node?.id
          ),
        },
      }),
    });
  }, [fetchMore, pageInfo]);

  return (
    <Section title={t('reports.events.title')} testID="reports-events" list>
      {canAdmin || canSystem ? (
        <View style={{ paddingHorizontal: theme.space.lg, gap: theme.space.sm }}>
          <Row gap="sm" wrap align="center">
            <Text variant="label" tone="muted">
              {t('reports.events.kind')}
            </Text>
            {accessChoices.map((level) => (
              <Chip
                key={level}
                testID={`reports-events-access-${level}`}
                label={t(`reports.events.access.${level}`)}
                selected={accessLevels.includes(level)}
                onPress={() => setAccessLevels((current) => toggled(current, level))}
              />
            ))}
          </Row>
          <Row gap="sm" wrap align="center">
            <Text variant="label" tone="muted">
              {t('reports.events.level')}
            </Text>
            {levelChoices.map((level) => (
              <Chip
                key={level}
                testID={`reports-events-level-${level}`}
                label={t(`reports.events.levels.${level}`)}
                selected={levels.includes(level)}
                onPress={() => setLevels((current) => toggled(current, level))}
              />
            ))}
          </Row>
        </View>
      ) : null}
      {loading && !events.length ? (
        <View style={{ padding: theme.space.lg }}>
          <Skeleton lines={4} />
        </View>
      ) : null}
      {!loading && !events.length ? (
        <EmptyState
          testID="reports-events-empty"
          icon="history"
          title={t('reports.events.empty')}
        />
      ) : null}
      {events.map((event) => {
        const who = event.createdBy?.user?.name || t('reports.events.system');
        const when = formatDateTime(event.createdAt, timeZone);
        const level = t(`reports.events.levels.${event.level ?? EventLevel.Info}`);
        const expanded = open === event.id;
        return (
          <View key={event.id}>
            <ListRow
              testID={`reports-event-${event.id}`}
              title={event.message || level}
              supporting={`${who} · ${when}`}
              aria-label={`${event.message || level}, ${who}, ${when}`}
              leading={<Avatar name={who} imageUri={event.createdBy?.user?.image} size="sm" />}
              trailing={
                <Text variant="caption" tone={LEVEL_TONE[event.level ?? EventLevel.Info]}>
                  {level}
                </Text>
              }
              onPress={
                event.details
                  ? () => setOpen((current) => (current === event.id ? undefined : event.id))
                  : undefined
              }
            />
            {expanded && event.details ? (
              <View style={{ paddingHorizontal: theme.space.lg, paddingBottom: theme.space.sm }}>
                <Text
                  variant="bodyCompact"
                  tone="muted"
                  testID={`reports-event-${event.id}-details`}
                >
                  {event.details}
                </Text>
              </View>
            ) : null}
          </View>
        );
      })}
      {pageInfo?.hasNextPage ? (
        <View style={{ paddingHorizontal: theme.space.lg }}>
          <Button
            variant="tertiary"
            testID="reports-events-more"
            label={t('reports.events.more')}
            onPress={onMore}
          />
        </View>
      ) : null}
    </Section>
  );
}
