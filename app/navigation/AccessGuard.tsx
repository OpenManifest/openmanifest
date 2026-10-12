import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EmptyState, useStyles } from 'app/ui';
import type { AccessRule } from './destinations';
import { useAccessDecision } from './useDestinations';

export function NoAccess() {
  const { t } = useTranslation('common');

  return <EmptyState testID="no-access" title={t('noAccess.title')} body={t('noAccess.body')} />;
}

export function NotAvailable() {
  const { t } = useTranslation('common');

  return (
    <EmptyState
      testID="not-available"
      title={t('notAvailable.title')}
      body={t('notAvailable.body')}
    />
  );
}

function Loading() {
  const { t } = useTranslation('common');
  const styles = useStyles(() => ({
    box: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  }));

  return (
    <View style={styles.box}>
      <ActivityIndicator accessibilityLabel={t('loading')} />
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

    if (decision === 'loading') return <Loading />;
    if (decision === 'no-access') return <NoAccess />;
    if (decision === 'not-available') return <NotAvailable />;
    return <Screen {...props} />;
  }
  Guarded.displayName = `Guarded(${Screen.displayName || Screen.name || 'Screen'})`;
  return Guarded;
}
