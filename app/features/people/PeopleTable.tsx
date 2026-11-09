import * as React from 'react';
import { View, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Avatar, Tappable, Text, useTheme } from 'app/ui';
import { formatMoney } from 'app/i18n/format';
import { nameOf, roleLabel, summaryOf, type Person } from './people';
import { PersonMenu, ReadinessBadge, useReason, type PersonActions } from './PersonParts';

export type PeopleTableProps = PersonActions & {
  people: readonly Person[];
  /** "Today", "8 Oct 2027", "Never" for a person */
  lastLoadOf(person: Person): string;
  testID?: string;
};

type Column = 'name' | 'role' | 'licence' | 'status' | 'credit' | 'lastLoad' | 'actions';

/** How much of the width each column takes; the actions hold one icon button */
const FLEX: Record<Exclude<Column, 'actions'>, number> = {
  name: 3,
  role: 2,
  licence: 2,
  status: 2,
  credit: 1.5,
  lastLoad: 1.5,
};

/**
 * The people as a table (wide windows): name, role, licence, whether they are ready (with the reason), credit and when
 * they last flew, one row each with its actions. A table to screen readers: column headers, rows, cells; the name opens
 * the profile.
 */
export default function PeopleTable({
  people,
  lastLoadOf,
  onOpen,
  onManifest,
  onAddCredit,
  testID = 'people-table',
}: PeopleTableProps) {
  const { t } = useTranslation(['common', 'terms']);
  const theme = useTheme();
  const reasonOf = useReason();
  const actionsWidth = theme.density.touchTarget;

  const cell = (column: Column): ViewStyle =>
    column === 'actions'
      ? { width: actionsWidth, alignItems: 'flex-end' }
      : {
          flex: FLEX[column],
          minWidth: 0,
          alignItems: column === 'credit' ? 'flex-end' : 'flex-start',
        };
  const row: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    paddingHorizontal: theme.space.lg,
  };
  const headers: [Column, string][] = [
    ['name', t('common:people.column.name')],
    ['role', t('common:people.column.role')],
    ['licence', t('terms:certification', { count: 1 })],
    ['status', t('common:people.column.status')],
    ['credit', t('common:people.column.credit')],
    ['lastLoad', t('common:people.column.lastLoad', { load: t('terms:load', { count: 1 }) })],
    ['actions', t('common:people.column.actions')],
  ];

  return (
    <View
      role="table"
      aria-label={t('common:people.table')}
      testID={testID}
      style={{
        backgroundColor: theme.colour.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colour.border,
        overflow: 'hidden',
      }}
    >
      <View
        role="row"
        style={{
          ...row,
          paddingVertical: theme.space.sm,
          borderBottomWidth: 1,
          borderBottomColor: theme.colour.border,
          backgroundColor: theme.colour.raised,
        }}
      >
        {headers.map(([column, label]) =>
          column === 'actions' ? (
            // Named for screen readers; the column of icon buttons needs no visible heading
            <View key={column} role="columnheader" aria-label={label} style={cell(column)} />
          ) : (
            <View key={column} role="columnheader" style={cell(column)}>
              <Text variant="label" tone="muted" numberOfLines={1}>
                {label}
              </Text>
            </View>
          )
        )}
      </View>
      {people.map((person, index) => {
        const name = nameOf(person);
        const summary = summaryOf(person.eligibility);
        const reason = reasonOf(summary);
        const id = `people-row-${person.id}`;
        const negative = (person.creditsCents ?? 0) < 0;
        return (
          <View
            key={person.id}
            role="row"
            testID="people-row"
            style={{
              ...row,
              minHeight: theme.density.row,
              paddingVertical: theme.space.xs,
              borderTopWidth: index ? 1 : 0,
              borderTopColor: theme.colour.border,
            }}
          >
            <View role="cell" style={cell('name')}>
              <Tappable
                role="button"
                aria-label={name}
                minTarget={false}
                testID={`${id}-open`}
                onPress={() => onOpen(person)}
                style={({ pressed, hovered }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.space.sm,
                  maxWidth: '100%',
                  paddingVertical: theme.space.xs,
                  borderRadius: theme.radius.sm,
                  backgroundColor: pressed || hovered ? theme.colour.raised : 'transparent',
                })}
              >
                <Avatar name={name} imageUri={person.user.image} size="sm" />
                <View style={{ flexShrink: 1 }}>
                  <Text tone="brand" numberOfLines={1}>
                    {name}
                  </Text>
                  {person.user.email ? (
                    <Text variant="caption" tone="muted" numberOfLines={1}>
                      {person.user.email}
                    </Text>
                  ) : null}
                </View>
              </Tappable>
            </View>
            <View role="cell" style={cell('role')}>
              <Text variant="bodyCompact" numberOfLines={1}>
                {roleLabel(person.role?.name) || t('common:people.none')}
              </Text>
            </View>
            <View role="cell" style={cell('licence')}>
              <Text
                variant="bodyCompact"
                tone={person.certificationLevel ? 'default' : 'muted'}
                numberOfLines={1}
              >
                {person.certificationLevel?.name ?? t('common:people.none')}
              </Text>
            </View>
            <View role="cell" style={{ ...cell('status'), gap: theme.space.xs }}>
              <ReadinessBadge summary={summary} testID={`${id}-status`} />
              {reason ? (
                <Text
                  variant="caption"
                  tone={summary.status === 'blocked' ? 'blocked' : 'warning'}
                  numberOfLines={2}
                  testID={`${id}-reason`}
                >
                  {reason}
                </Text>
              ) : null}
            </View>
            <View role="cell" style={cell('credit')}>
              <Text
                variant="bodyCompact"
                tone={negative ? 'blocked' : 'default'}
                numberOfLines={1}
                testID={`${id}-credit`}
              >
                {formatMoney(person.creditsCents)}
              </Text>
            </View>
            <View role="cell" style={cell('lastLoad')}>
              <Text variant="bodyCompact" numberOfLines={1} testID={`${id}-last`}>
                {lastLoadOf(person)}
              </Text>
            </View>
            <View role="cell" style={cell('actions')}>
              <PersonMenu
                person={person}
                onOpen={onOpen}
                onManifest={onManifest}
                onAddCredit={onAddCredit}
                testID={id}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
