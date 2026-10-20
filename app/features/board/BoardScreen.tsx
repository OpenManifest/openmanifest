import * as React from 'react';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Button, EmptyState, Skeleton, Text, useTheme } from 'app/ui';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import FloatingActionArea from 'app/components/layout/FloatingActionArea';
import useBreakpoint from 'app/components/layout/useBreakpoint';
import DateBar from 'app/screens/authenticated/manifest/manifest/DateBar';
import { LoadView } from 'app/features/load/LoadScreen';
import { useCrewRolesQuery } from 'app/api/reflection';
import type { LoadDetailsFragment } from 'app/api/operations';
import { Permission } from 'app/api/schema.d';
import { LoadContextProvider, useManifestContext, useOperatorContext } from 'app/providers';
import useRestriction from 'app/hooks/useRestriction';
import { moduleEnabled } from 'app/utils/modules';
import ConditionsStrip from './ConditionsStrip';
import LoadActions from './LoadActions';
import LoadCard from './LoadCard';
import { COLUMN_WIDTH, MAX_CONTENT_WIDTH, layoutOf, splitLoads } from './layout';
import { useBoard } from './useBoard';

/** The module whose operators see the conditions of the day on the board */
export const CONDITIONS_MODULE = 'winds_aloft';

/**
 * The board of the day: a column of cards on a phone, the list beside the selected load on a tablet, and a column for
 * each load with a strip for the finished ones on a wide window. The day and the loads come from `useBoard`.
 */
export default function BoardScreen() {
  const { t } = useTranslation(['common', 'terms']);
  const theme = useTheme();
  const navigation = useNavigation();
  const layout = layoutOf(useBreakpoint());
  const board = useBoard();
  const {
    operator: { operator, called, refetch: refetchOperator },
  } = useOperatorContext();
  const isFocused = useIsFocused();
  const { dialogs } = useManifestContext();
  const canCreateLoad = useRestriction(Permission.CreateLoad);
  const canUpdateWeather = useRestriction(Permission.UpdateWeatherConditions);
  const { data: crew } = useCrewRolesQuery({
    variables: { operatorId: operator?.id as string },
    skip: !operator?.id,
  });
  const crewRoles = React.useMemo(
    () => crew?.operator?.crewRoles ?? [],
    [crew?.operator?.crewRoles]
  );
  const { active, over } = React.useMemo(() => splitLoads(board.loads), [board.loads]);
  const [selectedId, select] = React.useState<string | null>(null);
  const selected = board.loads.find(({ id }) => id === selectedId) ?? active[0] ?? board.loads[0];
  // Whatever the operator or the user's standing at it (credits, permissions) became while the board was away
  React.useEffect(() => {
    if (isFocused) refetchOperator();
  }, [isFocused, refetchOperator]);

  const loadTerm = t('terms:load', { count: 1 });
  const loadsTerm = t('terms:load', { count: 2 }).toLowerCase();

  const openLoad = React.useCallback(
    (load: LoadDetailsFragment) =>
      navigation.navigate('Authenticated', {
        screen: 'Manifest',
        params: { screen: 'LoadScreen', params: { loadId: load.id } },
      }),
    [navigation]
  );
  const openWeather = React.useCallback(
    () =>
      navigation.navigate('Authenticated', {
        screen: 'Manifest',
        params: { screen: 'WindScreen' },
      }),
    [navigation]
  );

  const card = (load: LoadDetailsFragment, onPress: () => void) => (
    <LoadCard
      key={load.id}
      load={load}
      crewRoles={crewRoles}
      timeZone={operator?.timeZone}
      highlighted={board.isChanged(load.id)}
      selected={layout === 'split' && selected?.id === load.id}
      onPress={onPress}
      action={<LoadActions load={load} crewRoles={crewRoles} />}
    />
  );

  const header = (
    <View style={{ gap: theme.space.md, paddingBottom: theme.space.md }}>
      <DateBar />
      {moduleEnabled(operator?.modules, CONDITIONS_MODULE) ? (
        <ConditionsStrip
          testID="board-conditions"
          conditions={operator?.currentConditions}
          onUpdate={canUpdateWeather ? openWeather : undefined}
        />
      ) : null}
    </View>
  );

  const loading = !operator || !called || (board.loading && !board.loads.length);
  const empty = (
    <EmptyState
      testID="board-empty"
      icon="calendar-blank-outline"
      title={t(board.isToday ? 'common:board.empty.today' : 'common:board.empty.day', {
        loads: loadsTerm,
      })}
      body={t(board.isToday ? 'common:board.empty.todayBody' : 'common:board.empty.dayBody')}
      action={
        canCreateLoad
          ? {
              label: t('common:board.create', { load: loadTerm.toLowerCase() }),
              onPress: () => dialogs.load.open({}),
            }
          : undefined
      }
    />
  );

  let body: React.ReactNode;
  if (loading) {
    body = (
      <View style={{ gap: theme.space.md }} testID="board-loading">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} height={168} />
        ))}
      </View>
    );
  } else if (!board.loads.length) {
    body = empty;
  } else if (layout === 'columns') {
    body = (
      <ScrollView horizontal testID="loads" showsHorizontalScrollIndicator>
        <View style={{ flexDirection: 'row', gap: theme.space.lg, alignItems: 'flex-start' }}>
          {active.map((load) => (
            <View key={load.id} style={{ width: COLUMN_WIDTH }}>
              {card(load, () => openLoad(load))}
            </View>
          ))}
          {over.length ? (
            <View
              testID="board-finished"
              style={{ width: COLUMN_WIDTH * 0.75, gap: theme.space.md }}
              accessibilityLabel={t('common:board.completedStrip', { count: over.length })}
            >
              <Text variant="label" tone="muted" role="heading" aria-level={2}>
                {t('common:board.completedStrip', { count: over.length })}
              </Text>
              {over.map((load) => card(load, () => openLoad(load)))}
            </View>
          ) : null}
        </View>
      </ScrollView>
    );
  } else if (layout === 'split') {
    body = (
      <View style={{ flexDirection: 'row', gap: theme.space.lg, flex: 1 }}>
        <FlatList
          testID="loads"
          style={{ width: 360, flexGrow: 0 }}
          data={board.loads}
          keyExtractor={({ id }) => id}
          ItemSeparatorComponent={() => <View style={{ height: theme.space.md }} />}
          renderItem={({ item }) => card(item, () => select(item.id))}
          refreshControl={
            <RefreshControl refreshing={board.refreshing} onRefresh={() => board.refetch()} />
          }
        />
        <View style={{ flex: 1 }} testID="board-selected">
          {selected ? (
            <View style={{ alignItems: 'flex-end', paddingBottom: theme.space.sm }}>
              <Button
                variant="tertiary"
                icon="open-in-new"
                testID="board-open-load"
                label={t('common:board.openLoad', { load: loadTerm.toLowerCase() })}
                onPress={() => openLoad(selected)}
              />
            </View>
          ) : null}
          {selected ? (
            <LoadContextProvider key={selected.id} id={selected.id}>
              <LoadView embedded />
            </LoadContextProvider>
          ) : (
            <Text tone="muted">
              {t('common:board.selectLoad', { load: loadTerm.toLowerCase() })}
            </Text>
          )}
        </View>
      </View>
    );
  } else {
    body = (
      <FlatList
        testID="loads"
        data={board.loads}
        keyExtractor={({ id }) => id}
        ItemSeparatorComponent={() => <View style={{ height: theme.space.md }} />}
        renderItem={({ item }) => card(item, () => openLoad(item))}
        // Room for the button that floats below the last load
        contentContainerStyle={{ paddingBottom: theme.space.xxxl + theme.space.xxl }}
        refreshControl={
          <RefreshControl refreshing={board.refreshing} onRefresh={() => board.refetch()} />
        }
      />
    );
  }

  return (
    <ScreenContainer edges={['bottom']}>
      <View
        testID="board"
        style={{
          flex: 1,
          width: '100%',
          maxWidth: MAX_CONTENT_WIDTH,
          alignSelf: 'center',
          padding: theme.space.lg,
        }}
      >
        {header}
        {body}
      </View>
      {canCreateLoad && board.loads.length ? (
        <FloatingActionArea>
          <Button
            testID="new-load-primary-action"
            icon="plus"
            label={t('common:board.create', { load: loadTerm.toLowerCase() })}
            onPress={() => dialogs.load.open({})}
          />
        </FloatingActionArea>
      ) : null}
    </ScreenContainer>
  );
}
