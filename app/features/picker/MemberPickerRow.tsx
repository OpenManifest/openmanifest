import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, Row, Tappable, Text, useTheme } from 'app/ui';
import { formatMoney } from 'app/i18n/format';
import EligibilityBadge from 'app/features/load/EligibilityBadge';
import { readinessOf } from 'app/features/load/eligibility';
import type { PickerMember } from './members';

export type MemberPickerRowProps = {
  member: PickerMember;
  selected?: boolean;
  onSelect?(member: PickerMember): void;
  /** Opens the member's profile, where what is wrong can be put right */
  onFix?(member: PickerMember): void;
  testID?: string;
};

/**
 * A member in the picker: who they are, their licence and their credit, and whether they can go on this load: the reason
 * in words when they cannot, with the way to put it right.
 */
export default function MemberPickerRow({
  member,
  selected = false,
  onSelect,
  onFix,
  testID = 'picker-row',
}: MemberPickerRowProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const name = member.user.nickname || member.user.name || '';
  const readiness = readinessOf(member.eligibility.rules);
  const reason =
    readiness.status === 'blocked'
      ? (readiness.result.message ??
        t('load.notReady', {
          rule: t(`load.rule.${readiness.result.code}`, { defaultValue: readiness.result.code }),
        }))
      : null;
  const details = [member.certificationLevel?.name, formatMoney(member.creditsCents)]
    .filter(Boolean)
    .join(' · ');

  return (
    <View
      testID={testID}
      style={{
        backgroundColor: selected ? theme.colour.brandSoft : theme.colour.surface,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: selected ? theme.colour.brand : theme.colour.border,
      }}
    >
      <Row align="center" gap="sm" padding="sm">
        <Tappable
          role="button"
          aria-label={name}
          aria-pressed={selected}
          minTarget={false}
          testID={`${testID}-select`}
          onPress={onSelect ? () => onSelect(member) : undefined}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: theme.space.md }}
        >
          <Avatar name={name} imageUri={member.user.image} size="sm" />
          <View style={{ flex: 1, gap: theme.space.xs }}>
            <Text numberOfLines={1}>{name}</Text>
            <Text variant="caption" tone={reason ? 'blocked' : 'muted'} numberOfLines={2}>
              {reason ?? details}
            </Text>
          </View>
          <EligibilityBadge rules={member.eligibility.rules} testID={`${testID}-eligibility`} />
        </Tappable>
        {reason && onFix ? (
          <Button
            variant="secondary"
            label={t('picker.fix')}
            aria-label={t('picker.fixFor', { name })}
            testID={`${testID}-fix`}
            onPress={() => onFix(member)}
          />
        ) : null}
      </Row>
    </View>
  );
}
