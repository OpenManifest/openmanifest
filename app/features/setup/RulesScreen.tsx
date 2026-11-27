import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import FormColumn from 'app/components/layout/FormColumn';
import useTerms from 'app/i18n/useTerms';
import { UNIT_CHOICES } from 'app/i18n/units';
import { Button, Row, Select, Skeleton, Switch, Text, useTheme } from 'app/ui';
import Section from 'app/features/profile/Section';
import CallScheduleEditor from './CallScheduleEditor';
import { CURRENCIES, UNIT_QUANTITIES, rulesIn, type RuleSwitch, type RulesValues } from './rules';
import useRules from './useRules';

/**
 * The operator's rules (Setup → Business): who may book themselves, what a person needs before they fly, the boarding
 * calls, the units and money the operator shows, and the optional modules of its template. The changes are saved together.
 */
export default function RulesScreen() {
  const { t } = useTranslation('common');
  const term = useTerms();
  const theme = useTheme();
  const { operator, values, switches, modulesLoading, dirty, saving, change, save, discard } =
    useRules();

  if (!operator || !values) {
    return (
      <ScreenContainer edges={['bottom']}>
        <View style={{ padding: theme.space.lg, gap: theme.space.md }} testID="rules-loading">
          <Skeleton height={160} />
          <Skeleton height={240} />
        </View>
      </ScreenContainer>
    );
  }

  const modules = (operator.modules ?? {}) as Record<string, unknown>;
  const words = {
    equipment: term('equipment').toLowerCase(),
    load: term('load').toLowerCase(),
    loads: term('load', 2).toLowerCase(),
    vehicles: term('vehicle', 2).toLowerCase(),
  };
  const setRule = (key: RuleSwitch['key'], on: boolean) =>
    change((current) => ({ ...current, rules: { ...current.rules, [key]: on } }));
  const ruleSwitch = (rule: RuleSwitch) => (
    <Switch
      key={rule.key}
      testID={`rule-${rule.key}`}
      label={t(`rules.rule.${rule.key}.label`, words)}
      helperText={t(`rules.rule.${rule.key}.help`, words)}
      value={values.rules[rule.key]}
      disabled={saving}
      onChange={(on) => setRule(rule.key, on)}
    />
  );
  const set = <K extends keyof RulesValues>(key: K, value: RulesValues[K]) =>
    change((current) => ({ ...current, [key]: value }));

  return (
    <ScreenContainer edges={['bottom']} testID="rules">
      <FormColumn contentContainerStyle={{ paddingTop: theme.space.lg, gap: theme.space.lg }}>
        <Section title={t('rules.sections.booking')} testID="rules-booking">
          {rulesIn('booking', modules).map(ruleSwitch)}
        </Section>

        <Section title={t('rules.sections.eligibility')} testID="rules-eligibility">
          <Text tone="muted">{t('rules.eligibilityHelp', words)}</Text>
          {rulesIn('eligibility', modules).map(ruleSwitch)}
        </Section>

        <Section title={t('rules.sections.calls')} testID="rules-calls">
          <Text tone="muted">{t('rules.callsHelp', words)}</Text>
          <CallScheduleEditor
            value={values.callScheduleMinutes}
            onChange={(next) => set('callScheduleMinutes', next)}
            disabled={saving}
          />
        </Section>

        <Section title={t('rules.sections.units')} testID="rules-units">
          {UNIT_QUANTITIES.map((quantity) => (
            <Select
              key={quantity}
              testID={`rules-unit-${quantity}`}
              label={t(`rules.unit.${quantity}`)}
              value={values.units[quantity]}
              disabled={saving}
              options={UNIT_CHOICES[quantity].map((unit) => ({
                value: unit,
                label: t(`units.${unit}`),
              }))}
              onChange={(unit) => set('units', { ...values.units, [quantity]: unit })}
            />
          ))}
          <Select
            testID="rules-currency"
            label={t('rules.currency')}
            helperText={t('rules.currencyHelp')}
            value={values.currency}
            disabled={saving}
            options={CURRENCIES.map((code) => ({ value: code, label: code }))}
            onChange={(currency) => set('currency', currency)}
          />
        </Section>

        <Section title={t('rules.sections.modules')} testID="rules-modules">
          <Text tone="muted">{t('rules.modulesHelp')}</Text>
          {modulesLoading && !switches.length ? <Skeleton lines={3} /> : null}
          {switches.map((module) => (
            <Switch
              key={module.name}
              testID={`module-${module.name}`}
              label={t(`rules.module.${module.name}.label`, words)}
              helperText={
                module.locked
                  ? t('rules.moduleLocked')
                  : t(`rules.module.${module.name}.help`, words)
              }
              value={values.modules[module.name] ?? module.on}
              disabled={saving || module.locked}
              onChange={(on) => set('modules', { ...values.modules, [module.name]: on })}
            />
          ))}
        </Section>
      </FormColumn>
      {dirty ? (
        // Out of the scroll: the save stays in reach while the rules scroll
        <View
          testID="rules-actions"
          style={{
            padding: theme.space.md,
            backgroundColor: theme.colour.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colour.border,
          }}
        >
          <Row gap="sm" justify="end" wrap>
            <Button
              label={t('rules.discard')}
              variant="tertiary"
              disabled={saving}
              onPress={discard}
            />
            <Button
              label={t('rules.save')}
              icon="check"
              loading={saving}
              onPress={save}
              testID="rules-save-primary-action"
            />
          </Row>
        </View>
      ) : null}
    </ScreenContainer>
  );
}
