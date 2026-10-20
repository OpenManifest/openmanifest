import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Avatar, Row, Tappable, Text, useTheme } from 'app/ui';
import { formatMoney } from 'app/i18n/format';
import { nameOf, roleLabel, summaryOf, type Person } from './people';
import { PersonMenu, ReadinessBadge, useReason, type PersonActions } from './PersonParts';

export type PersonRowProps = PersonActions & {
  person: Person;
  /** "Today", "8 Oct 2027", "Never" */
  lastLoad: string;
  testID?: string;
};

/**
 * A person in the list (phones and tablets): who they are, their role, licence, credit and when they last flew, whether
 * they are ready with the reason when they are not, and their actions. The row opens the profile.
 */
export default function PersonRow({
  person,
  lastLoad,
  onOpen,
  onManifest,
  onAddCredit,
  testID = 'people-row',
}: PersonRowProps) {
  const { t } = useTranslation(['common', 'terms']);
  const theme = useTheme();
  const reasonOf = useReason();
  const name = nameOf(person);
  const summary = summaryOf(person.eligibility);
  const reason = reasonOf(summary);
  const id = `${testID}-${person.id}`;
  const details = [
    roleLabel(person.role?.name),
    person.certificationLevel?.name,
    formatMoney(person.creditsCents),
    t('common:people.last', { load: t('terms:load', { count: 1 }), date: lastLoad }),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View testID={testID}>
      <Row align="center" gap="xs">
        <Tappable
          role="button"
          aria-label={name}
          minTarget={false}
          testID={`${id}-open`}
          onPress={() => onOpen(person)}
          style={({ pressed, hovered }) => ({
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.space.md,
            minHeight: theme.density.row,
            paddingVertical: theme.space.sm,
            paddingStart: theme.space.lg,
            borderRadius: theme.radius.md,
            backgroundColor: pressed || hovered ? theme.colour.raised : 'transparent',
          })}
        >
          <Avatar name={name} imageUri={person.user.image} size="sm" />
          <View style={{ flex: 1, gap: theme.space.xs }}>
            <Text numberOfLines={1}>{name}</Text>
            <Text variant="caption" tone="muted" numberOfLines={2}>
              {details}
            </Text>
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
          <ReadinessBadge summary={summary} testID={`${id}-status`} />
        </Tappable>
        <PersonMenu
          person={person}
          onOpen={onOpen}
          onManifest={onManifest}
          onAddCredit={onAddCredit}
          testID={id}
        />
      </Row>
    </View>
  );
}
