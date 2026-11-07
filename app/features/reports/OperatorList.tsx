import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { OperatorStatisticsFragment } from 'app/api/operations';
import { OperatorState } from 'app/api/schema.d';
import { formatDate } from 'app/i18n/format';
import useTerms from 'app/i18n/useTerms';
import { Avatar, Chip, Divider, EmptyState, Row, Select, Text, useTheme } from 'app/ui';
import Section from 'app/features/profile/Section';

export const OPERATOR_STATES = [
  OperatorState.Public,
  OperatorState.Private,
  OperatorState.InReview,
  OperatorState.Archived,
];

export type OperatorListProps = {
  operators: OperatorStatisticsFragment[];
  /** The ids of the operators the figures above add up */
  counted: string[];
  onToggleCounted(id: string): void;
  onChangeState(operator: OperatorStatisticsFragment, state: OperatorState): void;
  /** The id of the operator whose state is being changed */
  saving?: string;
};

/**
 * The operators of the platform for its moderators: when each was made, its loads and active members, and its state
 * (public, private, in review, archived), which a moderator changes here. Each one's chip counts it in the figures or not.
 */
export default function OperatorList({
  operators,
  counted,
  onToggleCounted,
  onChangeState,
  saving,
}: OperatorListProps) {
  const { t } = useTranslation('common');
  const term = useTerms();
  const theme = useTheme();

  return (
    <Section title={term('operator', 2)} testID="platform-operators" list>
      {operators.length === 0 ? (
        <EmptyState
          testID="platform-operators-empty"
          icon="earth"
          title={t('platform.noOperators')}
        />
      ) : null}
      {operators.map((operator, index) => (
        <View key={operator.id}>
          {index > 0 ? <Divider /> : null}
          <View
            testID={`platform-operator-${operator.id}`}
            style={{
              paddingHorizontal: theme.space.lg,
              paddingVertical: theme.space.sm,
              gap: theme.space.sm,
            }}
          >
            <Row gap="md" align="center">
              <Avatar name={operator.name || ''} imageUri={operator.banner} size="sm" />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1}>{operator.name || ''}</Text>
                <Text variant="caption" tone="muted">
                  {t('platform.operatorFacts', {
                    created: formatDate(operator.createdAt, operator.timeZone),
                    count: operator.statistics?.loadsCount ?? 0,
                    loads: term('load', 2).toLowerCase(),
                    active: operator.statistics?.activeUserCount ?? 0,
                  })}
                </Text>
              </View>
            </Row>
            <Row gap="md" align="center" wrap>
              <View style={{ flexGrow: 1, minWidth: theme.space.xxxl * 4 }}>
                <Select<OperatorState>
                  testID={`platform-operator-${operator.id}-state`}
                  label={t('platform.state', { name: operator.name })}
                  value={operator.status}
                  disabled={saving === operator.id}
                  options={OPERATOR_STATES.map((state) => ({
                    value: state,
                    label: t(`platform.states.${state}`),
                  }))}
                  onChange={(state) => onChangeState(operator, state)}
                />
              </View>
              <Chip
                testID={`platform-operator-${operator.id}-counted`}
                label={t('platform.counted')}
                selected={counted.includes(operator.id)}
                onPress={() => onToggleCounted(operator.id)}
              />
            </Row>
          </View>
        </View>
      ))}
    </Section>
  );
}
