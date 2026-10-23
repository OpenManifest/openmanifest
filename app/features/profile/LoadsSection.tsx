import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, EmptyState, ListRow, StatusBadge } from 'app/ui';
import { formatDate, formatMoney } from 'app/i18n/format';
import { statusOf } from 'app/features/board/loadStatus';
import Section from './Section';
import type { ProfileSlot } from './profile';

export type LoadsSectionProps = {
  slots: readonly ProfileSlot[];
  /** There are older ones than these */
  hasMore?: boolean;
  loadingMore?: boolean;
  onMore?(): void;
  onOpen(slot: ProfileSlot): void;
  /** From the empty state: where loads are booked (the board) */
  onBoard?(): void;
  /** The profile is the viewer's own: the empty state speaks to them */
  self?: boolean;
  timeZone?: string | null;
  testID?: string;
};

/** The loads the member was on, newest first: number and day, type of jump and ticket, what it cost and its state */
export default function LoadsSection({
  slots,
  hasMore,
  loadingMore,
  onMore,
  onOpen,
  onBoard,
  self,
  timeZone,
  testID = 'profile-loads',
}: LoadsSectionProps) {
  const { t } = useTranslation(['common', 'terms']);
  const loads = t('terms:load_count', { count: 2 });

  return (
    <Section title={loads} list testID={testID}>
      {!slots.length ? (
        <EmptyState
          testID={`${testID}-empty`}
          icon="airplane-off"
          title={t('common:profile.loads.empty', { loads: loads.toLowerCase() })}
          body={
            self
              ? t('common:profile.loads.emptySelf', {
                  load: t('terms:load', { count: 1 }).toLowerCase(),
                })
              : t('common:profile.loads.emptyOther', { loads: loads.toLowerCase() })
          }
          action={
            onBoard ? { label: t('common:profile.loads.board'), onPress: onBoard } : undefined
          }
        />
      ) : (
        slots.map((slot) => {
          const title = t('common:loadNumber', {
            load: t('terms:load', { count: 1 }),
            number: slot.load.loadNumber,
          });
          const state = String(t(`terms:state.${slot.load.state}`));
          const date = slot.load.loadDate ? formatDate(slot.load.loadDate, timeZone) : '';
          const supporting = [
            slot.activityType?.name,
            slot.ticketType?.name,
            formatMoney(slot.costCents),
          ]
            .filter(Boolean)
            .join(' · ');
          return (
            <ListRow
              key={slot.id}
              testID={`${testID}-${slot.id}`}
              title={date ? `${title} · ${date}` : title}
              aria-label={`${title}, ${date}, ${state}`}
              supporting={supporting}
              onPress={() => onOpen(slot)}
              trailing={<StatusBadge status={statusOf(slot.load.state)} label={state} />}
            />
          );
        })
      )}
      {hasMore && onMore ? (
        <Button
          variant="tertiary"
          label={t('common:profile.loads.more')}
          loading={loadingMore}
          testID={`${testID}-more`}
          onPress={onMore}
        />
      ) : null}
    </Section>
  );
}
