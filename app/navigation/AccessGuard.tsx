import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useOperatorContext } from 'app/providers/operator/context';
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

/** Whose screen it is: the member a route is about (`userId`, or `membershipId` for an inspection) */
export function subjectOf(params: unknown): string | undefined {
  const { userId, membershipId } = (params ?? {}) as { userId?: unknown; membershipId?: unknown };
  const subject = userId ?? membershipId;
  return subject === undefined || subject === null ? undefined : String(subject);
}

/**
 * As `guarded`, except that a member always has their own: the screens about a member (profile, equipment, what they
 * paid) open for that member whatever their permissions, so the way to fix what Today says is wrong is not a dead end.
 */
export function guardedUnlessOwn<Props extends object>(
  Screen: React.ComponentType<Props>,
  rule: AccessRule
): React.ComponentType<Props> {
  const Guarded = guarded(Screen, rule);
  function Own(props: Props) {
    const route = useRoute();
    const {
      operator: { currentUser },
    } = useOperatorContext();
    const subject = subjectOf(route.params);

    if (subject && currentUser?.id === subject) return <Screen {...props} />;
    return <Guarded {...props} />;
  }
  Own.displayName = `Own(${Screen.displayName || Screen.name || 'Screen'})`;
  return Own;
}
