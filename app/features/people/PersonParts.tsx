import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, Menu, StatusBadge, type MenuItem, type StatusKey } from 'app/ui';
import { formatDate } from 'app/i18n/format';
import { lastLoadOf, nameOf, type Person, type Readiness, type Summary } from './people';

const STATUS: Record<Readiness, StatusKey> = {
  ready: 'ok',
  expiring: 'warning',
  blocked: 'blocked',
};

/** Ready, expiring or blocked, as a badge (colour, icon and word) */
export function ReadinessBadge({ summary, testID }: { summary: Summary; testID?: string }) {
  const { t } = useTranslation('common');
  return (
    <StatusBadge
      status={STATUS[summary.status]}
      label={t(`people.status.${summary.status}`)}
      testID={testID}
    />
  );
}

/** Why a person is not ready, or what runs out soon, in words: the server's message, else the rule's name */
export function useReason() {
  const { t } = useTranslation('common');
  return React.useCallback(
    (summary: Summary): string | null => {
      if (summary.status === 'ready') return null;
      if (summary.rule?.message) return summary.rule.message;
      if (!summary.rule) return t('people.status.blocked');
      const rule = t(`load.rule.${summary.rule.code}`, {
        defaultValue: summary.rule.code.replace(/_/g, ' '),
      });
      return summary.status === 'blocked'
        ? t('load.notReady', { rule })
        : t('load.expiring', { rule });
    },
    [t]
  );
}

/** When a person last flew: "Today", "8 Oct 2027" or "Never" */
export function useLastLoad(today: string, timeZone?: string | null) {
  const { t } = useTranslation('common');
  return React.useCallback(
    (person: Pick<Person, 'lastSlot'>): string => {
      const last = lastLoadOf(person, today);
      if (last.when === 'today') return t('people.today');
      if (last.when === 'never' || !last.date) return t('people.never');
      return formatDate(last.date, timeZone);
    },
    [t, timeZone, today]
  );
}

export type PersonActions = {
  onOpen(person: Person): void;
  /** Puts them on a load: absent for those who may not manifest others */
  onManifest?(person: Person): void;
  /** Adds to their credit: absent for those who may not */
  onAddCredit?(person: Person): void;
};

/** The actions on a person, behind the three dots of their row: the profile, "Manifest on…", "Add credit" */
export function PersonMenu({
  person,
  onOpen,
  onManifest,
  onAddCredit,
  testID,
}: PersonActions & { person: Person; testID: string }) {
  const { t } = useTranslation('common');
  const label = t('people.menu', { name: nameOf(person) });
  const items: MenuItem[] = [
    {
      label: t('people.action.profile'),
      icon: 'account-outline',
      testID: 'people-action-profile',
      onPress: () => onOpen(person),
    },
  ];
  if (onManifest) {
    items.push({
      label: t('people.action.manifest'),
      icon: 'airplane-plus',
      testID: 'people-action-manifest',
      onPress: () => onManifest(person),
    });
  }
  if (onAddCredit) {
    items.push({
      label: t('people.action.credit'),
      icon: 'cash-plus',
      testID: 'people-action-credit',
      onPress: () => onAddCredit(person),
    });
  }

  return (
    <Menu
      label={label}
      trigger={<IconButton icon="dots-vertical" aria-label={label} testID={`${testID}-menu`} />}
      items={items}
    />
  );
}
