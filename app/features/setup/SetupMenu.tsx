import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { decide } from 'app/navigation/destinations';
import { useAccess } from 'app/navigation/useDestinations';
import useTerms from 'app/i18n/useTerms';
import { Divider, Icon, ListRow, Skeleton, Stack, Text, useTheme } from 'app/ui';
import {
  VISIBILITY_RULE,
  setupGroupsFor,
  type SetupEntry,
  type SetupRoute,
  type SetupTitle,
} from './entries';
import VisibilitySwitch from './VisibilitySwitch';

/** The title of an entry: a string of the app, or the operator's word */
export function useSetupTitle() {
  const { t } = useTranslation('common');
  const term = useTerms();
  return React.useCallback(
    (title: SetupTitle) => ('term' in title ? term(title.term, title.count) : t(title.key)),
    [t, term]
  );
}

export type SetupMenuProps = {
  /** The screen shown beside the list (marked as the current one) */
  selected?: string;
  onOpen(route: SetupRoute): void;
};

/**
 * Setup's list: Operations, People and access, Business, each a card of rows (only the entries the user may open at this
 * operator), and at the end of Business the switch that makes the operator public.
 */
export default function SetupMenu({ selected, onOpen }: SetupMenuProps) {
  const { t } = useTranslation('common');
  const term = useTerms();
  const theme = useTheme();
  const titleOf = useSetupTitle();
  const { ready, access } = useAccess();

  if (!ready) {
    return (
      <Stack gap="md" testID="setup-menu-loading">
        <Skeleton height={160} />
        <Skeleton height={120} />
      </Stack>
    );
  }

  const groups = setupGroupsFor(access);
  const showVisibility = decide(VISIBILITY_RULE, access) === 'allowed';
  const words = {
    loads: term('load', 2).toLowerCase(),
    load: term('load').toLowerCase(),
    vehicles: term('vehicle', 2).toLowerCase(),
    equipment: term('equipment').toLowerCase(),
    destinations: term('destination', 2).toLowerCase(),
  };
  const row = (entry: SetupEntry) => {
    const title = titleOf(entry.title);
    return (
      <ListRow
        key={entry.key}
        testID={`setup-${entry.key}`}
        title={title}
        supporting={t(entry.supportingKey, words)}
        leading={
          <Icon name={entry.icon} tone={selected === entry.route ? 'onBrandSoft' : 'muted'} />
        }
        trailing={<Icon name="chevron-right" tone="muted" />}
        selected={selected === entry.route}
        onPress={() => onOpen(entry.route)}
      />
    );
  };

  return (
    <Stack gap="lg" testID="setup-menu">
      {groups.map((group) => (
        <View key={group.key} style={{ gap: theme.space.sm }} testID={`setup-group-${group.key}`}>
          <Text variant="title" role="heading" aria-level={2}>
            {t(group.titleKey)}
          </Text>
          <View
            style={{
              backgroundColor: theme.colour.surface,
              borderRadius: theme.radius.lg,
              borderWidth: 1,
              borderColor: theme.colour.border,
              overflow: 'hidden',
            }}
          >
            {group.entries.map((entry, index) => (
              <React.Fragment key={entry.key}>
                {index ? <Divider /> : null}
                {row(entry)}
              </React.Fragment>
            ))}
            {group.key === 'business' && showVisibility ? (
              <>
                <Divider />
                <VisibilitySwitch />
              </>
            ) : null}
          </View>
        </View>
      ))}
    </Stack>
  );
}
