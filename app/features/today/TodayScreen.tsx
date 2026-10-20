import * as React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { EmptyState, Skeleton, useTheme } from 'app/ui';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import useBreakpoint from 'app/components/layout/useBreakpoint';
import { useTodayQuery } from 'app/api/reflection';
import type { LoadDetailsFragment } from 'app/api/operations';
import { useManifestContext, useOperatorContext } from 'app/providers';
import { useNotifications } from 'app/providers/notifications';
import { useOperatorToday } from 'app/hooks/useOperatorToday';
import useOpenUser from 'app/navigation/useOpenUser';
import CreditCard from './CreditCard';
import DutiesCard from './DutiesCard';
import NextLoadCard from './NextLoadCard';
import ReadyChecklist from './ReadyChecklist';
import TodayLoads from './TodayLoads';
import { dutiesOf, loadsOfDay, nextLoadOf, placeOn } from './today';

/**
 * Where a member lands: the load they fly next (state, call, take-me-off when the dropzone lets them), whether they are
 * ready with the way to fix what is not, their credit, the loads of the day and, for crew, their duties.
 */
export default function TodayScreen() {
  const { t } = useTranslation(['common', 'terms']);
  const theme = useTheme();
  const navigation = useNavigation();
  const notify = useNotifications();
  const openUser = useOpenUser();
  const isFocused = useIsFocused();
  const wide = useBreakpoint() !== 'compact';
  const today = useOperatorToday();
  const {
    operator: { operator, currentUser },
  } = useOperatorContext();
  const {
    manifest: { deleteSlot, permissions },
  } = useManifestContext();
  const [taking, setTaking] = React.useState(false);

  const { data, loading, refetch } = useTodayQuery({
    variables: { operatorId: operator?.id as string, date: today },
    skip: !operator?.id,
    fetchPolicy: 'cache-and-network',
  });
  React.useEffect(() => {
    if (isFocused && operator?.id) refetch();
  }, [isFocused, operator?.id, refetch]);

  const me = data?.operator?.currentUser ?? null;
  const memberId = me?.id ?? currentUser?.id ?? '';
  const loads = React.useMemo(
    () =>
      loadsOfDay(
        (data?.loads?.edges ?? [])
          .map((edge) => edge?.node)
          .filter((node): node is LoadDetailsFragment => !!node)
      ),
    [data?.loads?.edges]
  );
  const next = React.useMemo(() => nextLoadOf(loads, memberId), [loads, memberId]);
  const duties = React.useMemo(() => dutiesOf(loads, memberId), [loads, memberId]);
  const mine = React.useMemo(
    () => new Set(loads.filter((load) => placeOn(load, memberId)).map(({ id }) => id)),
    [loads, memberId]
  );

  const openLoad = React.useCallback(
    (load: Pick<LoadDetailsFragment, 'id'>) =>
      navigation.navigate('Authenticated', {
        screen: 'Manifest',
        params: { screen: 'LoadScreen', params: { loadId: load.id } },
      }),
    [navigation]
  );

  const takeOff = async () => {
    if (!next) return;
    setTaking(true);
    try {
      const response = await deleteSlot({ id: Number(next.slot.id) });
      if ('error' in response && response.error) notify.error(response.error);
      else {
        notify.info(
          t('common:today.next.tookOff', {
            load: t('common:loadNumber', {
              load: t('terms:load', { count: 1 }),
              number: next.load.loadNumber,
            }),
          })
        );
        refetch();
      }
    } finally {
      setTaking(false);
    }
  };

  const waiting = !operator || (loading && !data);
  const column = (
    <View style={{ gap: theme.space.lg }}>
      {next ? (
        <NextLoadCard
          load={next.load}
          slot={next.slot}
          timeZone={operator?.timeZone}
          canTakeOff={permissions.canDeleteOwnSlot}
          deskOnly={!permissions.canDeleteOwnSlot}
          taking={taking}
          onTakeOff={takeOff}
          onOpen={() => openLoad(next.load)}
        />
      ) : null}
      {me?.eligibility ? (
        <ReadyChecklist
          rules={me.eligibility.rules}
          onFix={() => memberId && openUser('ProfileScreen', { userId: memberId })}
        />
      ) : null}
      {me ? <CreditCard creditsCents={me.creditsCents} /> : null}
    </View>
  );
  const side = (
    <View style={{ gap: theme.space.lg }}>
      <DutiesCard duties={duties} />
      {loads.length ? (
        <TodayLoads loads={loads} mineIds={mine} onOpen={openLoad} />
      ) : (
        <EmptyState
          testID="today-empty"
          icon="calendar-blank-outline"
          title={t('common:today.empty.title')}
          body={t('common:today.empty.body')}
        />
      )}
    </View>
  );

  return (
    <ScreenContainer edges={['bottom']}>
      <ScrollView
        testID="today"
        contentContainerStyle={{
          padding: theme.space.lg,
          gap: theme.space.lg,
          paddingBottom: theme.space.xxxl,
        }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refetch()} />}
      >
        {waiting ? (
          <View style={{ gap: theme.space.md }} testID="today-loading">
            <Skeleton height={160} />
            <Skeleton height={200} />
          </View>
        ) : wide ? (
          <View style={{ flexDirection: 'row', gap: theme.space.lg, alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>{column}</View>
            <View style={{ flex: 1 }}>{side}</View>
          </View>
        ) : (
          <View style={{ gap: theme.space.lg }}>
            {column}
            {side}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
