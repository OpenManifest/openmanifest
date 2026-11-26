import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Row, Text, useTheme } from 'app/ui';
import { formatDestination, formatMoney, formatQuantity } from 'app/i18n/format';
import { useOperatorFormat } from 'app/i18n/operatorFormat';
import type { ManifestValidation } from 'app/hooks/useManifestValidator';
import type { PickerMember, SlotDefaults } from './members';

export type DefaultsCardProps = {
  member: PickerMember;
  defaults: SlotDefaults;
  validation: ManifestValidation;
  /** The ticket and activity to pick from, in place of the last slot's two lines */
  choices?: React.ReactNode;
  /** The ticket is not the one the member last flew: its destination is the ticket's own, not shown here */
  ticketChanged?: boolean;
  /** Opens the full form for what the defaults do not cover */
  onChange?(): void;
  testID?: string;
};

/**
 * What the slot will be if nothing is changed: the member's last ticket, type of jump, destination, equipment and mass
 * with the price, and what the server says about that combination. "Change…" opens the whole form.
 */
export default function DefaultsCard({
  member,
  defaults,
  validation,
  choices,
  ticketChanged = false,
  onChange,
  testID = 'picker-defaults',
}: DefaultsCardProps) {
  const { t } = useTranslation(['common', 'terms']);
  const theme = useTheme();
  const units = useOperatorFormat((state) => state.units);
  const last = member.lastSlot;
  const lines = [
    {
      key: 'ticket',
      icon: 'ticket-outline' as const,
      text: choices ? null : last?.ticketType?.name,
    },
    {
      key: 'activity',
      icon: 'tag-outline' as const,
      text: choices ? null : last?.activityType?.name,
    },
    {
      key: 'destination',
      icon: 'map-marker-outline' as const,
      text:
        last?.destination && !ticketChanged && !choices
          ? formatDestination(last.destination, units)
          : null,
    },
    {
      key: 'equipment',
      icon: 'bag-personal-outline' as const,
      text: (last?.equipment ?? []).map(({ name }) => name).join(', ') || null,
    },
    {
      key: 'mass',
      icon: 'weight-kilogram' as const,
      text: defaults.bodyMassKg ? formatQuantity(defaults.bodyMassKg, 'mass', units) : null,
    },
    { key: 'price', icon: 'cash' as const, text: formatMoney(defaults.costCents) },
  ].filter((line) => !!line.text);
  const known = !!defaults.ticketTypeId && !!defaults.activityTypeId;

  return (
    <View
      testID={testID}
      style={{
        gap: theme.space.sm,
        padding: theme.space.md,
        borderTopWidth: 1,
        borderTopColor: theme.colour.border,
      }}
    >
      {choices}
      {known ? (
        <View style={{ gap: theme.space.xs }}>
          {lines.map(({ key, icon, text }) => (
            <Row key={key} gap="sm" align="center">
              <Icon name={icon} size={16} tone="muted" />
              <Text variant="bodyCompact" testID={`${testID}-${key}`}>
                {text}
              </Text>
            </Row>
          ))}
        </View>
      ) : choices ? null : (
        <Text tone="muted" testID={`${testID}-none`}>
          {t('common:picker.noDefaults', { name: member.user.name })}
        </Text>
      )}

      {validation.failures.map((result) => (
        <Text
          key={`${result.code}-${result.problem}`}
          variant="caption"
          tone={result.bypassed ? 'warning' : 'blocked'}
          testID={`${testID}-failure-${result.code}`}
        >
          {result.message}
          {result.bypassed ? ` ${t('common:picker.mayLetThrough')}` : ''}
        </Text>
      ))}

      {onChange ? (
        <Row justify="end">
          <Button
            variant="tertiary"
            label={t(known ? 'common:picker.change' : 'common:picker.choose')}
            testID={`${testID}-change`}
            onPress={onChange}
          />
        </Row>
      ) : null}
    </View>
  );
}
