import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Row, StatusBadge, Text, useTheme } from 'app/ui';
import type { EligibilityResultEssentialsFragment } from 'app/api/operations';
import { checkOf, sortedChecks } from './today';

export type ReadyChecklistProps = {
  rules: readonly EligibilityResultEssentialsFragment[];
  /** Puts the rule right (opens where it can be done); a row with something wrong or running out offers it */
  onFix?(rule: EligibilityResultEssentialsFragment): void;
  testID?: string;
};

/**
 * "Ready" for the day: one row for each thing that has to be right for the member to fly (membership, licence, credit,
 * equipment, …), what needs something first, with the way to fix it.
 */
export default function ReadyChecklist({
  rules,
  onFix,
  testID = 'today-ready',
}: ReadyChecklistProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const checks = sortedChecks(rules);
  const blocked = checks.filter((rule) => checkOf(rule) === 'blocked').length;

  return (
    <View
      testID={testID}
      style={{
        gap: theme.space.sm,
        padding: theme.space.lg,
        backgroundColor: theme.colour.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colour.border,
      }}
    >
      <Row justify="between" align="center" gap="md">
        <Text variant="title" role="heading" aria-level={2}>
          {t('today.ready.title')}
        </Text>
        <StatusBadge
          status={blocked ? 'blocked' : 'ok'}
          label={blocked ? t('today.ready.blocked', { count: blocked }) : t('today.ready.ok')}
          testID={`${testID}-status`}
        />
      </Row>
      {checks.map((rule) => {
        const status = checkOf(rule);
        const name = t(`load.rule.${rule.code}`, { defaultValue: rule.code.replace(/_/g, ' ') });
        return (
          <Row key={rule.code} gap="md" align="center" testID={`${testID}-${rule.code}`}>
            <Icon
              name={
                status === 'ok'
                  ? 'check-circle-outline'
                  : status === 'expiring'
                    ? 'clock-alert-outline'
                    : 'alert-circle-outline'
              }
              size={20}
              tone={status === 'ok' ? 'muted' : status === 'expiring' ? 'warning' : 'blocked'}
            />
            <View style={{ flex: 1 }}>
              <Text>{name}</Text>
              {status !== 'ok' && rule.message ? (
                <Text variant="caption" tone={status === 'blocked' ? 'blocked' : 'warning'}>
                  {rule.message}
                </Text>
              ) : null}
            </View>
            {status !== 'ok' && onFix ? (
              <Button
                variant="secondary"
                label={t('today.ready.fix')}
                aria-label={t('today.ready.fixFor', { rule: name })}
                testID={`${testID}-${rule.code}-fix`}
                onPress={() => onFix(rule)}
              />
            ) : null}
          </Row>
        );
      })}
    </View>
  );
}
