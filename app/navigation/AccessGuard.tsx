import * as React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { AccessRule } from './destinations';
import { useAccessDecision } from './useDestinations';

export function NoAccess() {
  const { t } = useTranslation('common');

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text
        role="heading"
        aria-level={2}
        testID="no-access"
        style={{ fontWeight: '600', fontSize: 18 }}
      >
        {t('noAccess.title')}
      </Text>
      <Text style={{ marginTop: 8, textAlign: 'center' }}>{t('noAccess.body')}</Text>
    </View>
  );
}

export function NotAvailable() {
  const { t } = useTranslation('common');

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text
        role="heading"
        aria-level={2}
        testID="not-available"
        style={{ fontWeight: '600', fontSize: 18 }}
      >
        {t('notAvailable.title')}
      </Text>
      <Text style={{ marginTop: 8, textAlign: 'center' }}>{t('notAvailable.body')}</Text>
    </View>
  );
}

/**
 * Wraps a tab's screen: a spinner while the permissions load, then the screen, or a no-access or not-available state.
 * The tabs are always registered, so a link to `/users` reaches the screen on a cold load and this decides what it shows.
 */
export default function guarded<Props extends object>(
  Screen: React.ComponentType<Props>,
  rule: AccessRule
): React.ComponentType<Props> {
  function Guarded(props: Props) {
    const decision = useAccessDecision(rule);

    if (decision === 'loading') {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator accessibilityLabel="Loading" />
        </View>
      );
    }
    if (decision === 'no-access') return <NoAccess />;
    if (decision === 'not-available') return <NotAvailable />;
    return <Screen {...props} />;
  }
  Guarded.displayName = `Guarded(${Screen.displayName || Screen.name || 'Screen'})`;
  return Guarded;
}
