import * as React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLinkTo, useNavigation } from '@react-navigation/native';
import { useOperatorsContext } from 'app/api/crud';
import { useLogout } from 'app/api/hooks/useLogout';
import useSelectOperator from 'app/hooks/useSelectOperator';
import { useOperatorContext } from 'app/providers/operator/context';
import {
  usePreferences,
  type ColorSchemePreference,
  type DensityPreference,
} from 'app/state/preferences';
import { useStyles } from 'app/ui';
import { formatMoney } from 'app/i18n/format';
import Row from './Row';
import Section from './Section';

const SCHEMES: ColorSchemePreference[] = ['system', 'light', 'dark'];
const DENSITIES: DensityPreference[] = ['auto', 'compact', 'regular', 'comfortable'];

/** The person, their places, how the app looks, which operator it shows and logging out */
export default function AccountScreen() {
  const { t } = useTranslation(['common', 'terms']);
  const linkTo = useLinkTo();
  const navigation = useNavigation();
  const logout = useLogout();
  const selectOperator = useSelectOperator();
  const { operators } = useOperatorsContext();
  const {
    operator: { operator, currentUser },
  } = useOperatorContext();
  const colorScheme = usePreferences((preferences) => preferences.colorScheme);
  const setColorScheme = usePreferences((preferences) => preferences.setColorScheme);
  const density = usePreferences((preferences) => preferences.density);
  const setDensity = usePreferences((preferences) => preferences.setDensity);
  const newBoard = usePreferences((preferences) => preferences.newBoard);
  const setNewBoard = usePreferences((preferences) => preferences.setNewBoard);
  const styles = useStyles((theme) => ({
    content: { paddingVertical: theme.space.lg, gap: theme.space.lg },
    person: { paddingHorizontal: theme.space.lg, gap: theme.space.xs },
    name: { ...theme.type.title, color: theme.colour.text },
    detail: { ...theme.type.bodyCompact, color: theme.colour.textMuted },
  }));
  const userId = currentUser?.id;
  const role = (currentUser?.role?.name ?? '').replace(/_/g, ' ');

  const switchTo = React.useCallback(
    async (item: NonNullable<typeof operators>[number]) => {
      if (item && (await selectOperator(item))) linkTo('/manifest');
    },
    [linkTo, selectOperator]
  );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.person}>
        <Text role="heading" aria-level={1} style={styles.name}>
          {currentUser?.user?.name ?? t('destinations.account')}
        </Text>
        <Text style={styles.detail}>
          {[operator?.name, role].filter(Boolean).join(' · ')}
          {currentUser ? ` · ${t('account.funds')} ${formatMoney(currentUser.creditsCents)}` : ''}
        </Text>
      </View>

      <Section title={t('destinations.account')}>
        <Row
          testID="account-profile"
          icon="account-outline"
          label={t('account.profile')}
          onPress={() => linkTo(`/user/${userId}`)}
        />
        <Row
          testID="account-equipment"
          icon="parachute-outline"
          label={t('terms:equipment', { count: 2 })}
          onPress={() => linkTo(`/user/${userId}/equipment`)}
        />
        <Row
          testID="account-transactions"
          icon="cash-multiple"
          label={t('account.transactions')}
          onPress={() => linkTo(`/user/${userId}/transactions`)}
        />
      </Section>

      <Section title={t('account.appearance')}>
        {SCHEMES.map((scheme) => (
          <Row
            key={scheme}
            role="radio"
            testID={`color-scheme-${scheme}`}
            label={t(`account.${scheme}`)}
            selected={colorScheme === scheme}
            onPress={() => setColorScheme(scheme)}
          />
        ))}
      </Section>

      <Section title={t('account.density')}>
        {DENSITIES.map((option) => (
          <Row
            key={option}
            role="radio"
            testID={`density-${option}`}
            label={t(`account.${option}`)}
            selected={density === option}
            onPress={() => setDensity(option)}
          />
        ))}
      </Section>

      <Section title={t('account.board')}>
        {[true, false].map((option) => (
          <Row
            key={String(option)}
            role="radio"
            testID={option ? 'board-new' : 'board-classic'}
            label={t(option ? 'account.newBoard' : 'account.classicBoard')}
            selected={newBoard === option}
            onPress={() => setNewBoard(option)}
          />
        ))}
      </Section>

      <Section title={t('account.switchOperator')}>
        {operators?.map((item) => (
          <Row
            key={item?.id}
            role="radio"
            testID={`operator-${item?.id}`}
            icon="map-marker-outline"
            label={item?.name ?? ''}
            selected={operator?.id === item?.id}
            onPress={() => switchTo(item)}
          />
        ))}
        <Row
          testID="operator-create"
          icon="plus"
          label={t('account.createOperator')}
          onPress={() => navigation.navigate('Wizards', { screen: 'OperatorWizardScreen' })}
        />
      </Section>

      <Section title={t('account.logout')}>
        <Row testID="account-logout" icon="logout" label={t('account.logout')} onPress={logout} />
      </Section>
    </ScrollView>
  );
}
