import * as React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStyles } from 'app/ui';
import type { AccessRule } from './destinations';
import { useAccessDecision } from './useDestinations';

function Notice({ title, body, testID }: { title: string; body: string; testID: string }) {
  const styles = useStyles((t) => ({
    box: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: t.space.xl,
      gap: t.space.sm,
    },
    title: { ...t.type.title, color: t.colour.text, textAlign: 'center' },
    body: { ...t.type.body, color: t.colour.textMuted, textAlign: 'center' },
  }));

  return (
    <View style={styles.box}>
      <Text role="heading" aria-level={2} testID={testID} style={styles.title}>
        {title}
      </Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

export function NoAccess() {
  const { t } = useTranslation('common');

  return <Notice testID="no-access" title={t('noAccess.title')} body={t('noAccess.body')} />;
}

export function NotAvailable() {
  const { t } = useTranslation('common');

  return (
    <Notice testID="not-available" title={t('notAvailable.title')} body={t('notAvailable.body')} />
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
