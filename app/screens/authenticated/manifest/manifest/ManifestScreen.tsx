import ManifestDeskNote from 'app/components/ManifestDeskNote';
import { useTranslation } from 'react-i18next';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import * as React from 'react';
import {
  ImageBackground,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import ProgressBar from 'app/components/ProgressBar';

import NoResults from 'app/components/NoResults';
import FloatingActionArea from 'app/components/layout/FloatingActionArea';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import { LoadState, Permission } from 'app/api/schema.d';
import { Button, IconButton, Menu } from 'app/ui';
import { useOperatorContext, useManifestContext } from 'app/providers';
import { LoadDetailsFragment } from 'app/api/operations';

import { useVehicles, useTickets } from 'app/api/crud';
import useRestriction from 'app/hooks/useRestriction';
import DragDropWrapper from '../../../../components/slots_table/DragAndDrop/DragDropSlotProvider';
import LoadCardSmall from './LoadCard/Small/Card';
import LoadCardLarge from './LoadCard/Large/Card';
import WeatherConditions from 'app/features/skydiving/weather/WeatherBoard';
import { hasWindsAloft } from 'app/features/skydiving/conditions/conditions';
import LoadingCardLarge from './LoadCard/Large/Loading';
import LoadingCardSmall from './LoadCard/Small/Loading';
import SetupProfileCard from './SetupProfileCard';
import DateBar from './DateBar';
import { SetupStepCard } from './FinishSetupSteps';

const loadingFragment: LoadDetailsFragment = {
  id: '__LOADING__',
  lockVersion: 0,
  loadDate: '',
  availableSlots: 0,
  createdAt: '',
  isFull: false,
  isOpen: false,
  loadNumber: 0,
  maxSlots: 0,
  occupiedSlots: 0,
  destinations: [],
  vehicles: [],
  crew: [],
  vehicle: {
    id: '__LOADING__',
    capacity: 0,
  },
  state: LoadState.Open,
  weight: 0,
};

const setupProfileCardFragment = { ...loadingFragment, id: '__SETUP_PROFILE_CARD__' };
const setupVehiclesCardFragment = { ...loadingFragment, id: '__SETUP_VEHICLE_CARD__' };
const setupTicketsCardFragment = { ...loadingFragment, id: '__SETUP_TICKETS_CARD__' };

export default function ManifestScreen() {
  const { t } = useTranslation(['common', 'terms']);
  const [display, setDisplay] = React.useState<'list' | 'cards'>('cards');
  const {
    operator: { operator, currentUser, loading, refetch },
    dialogs: sheets,
  } = useOperatorContext();
  const { manifest, dialogs } = useManifestContext();
  const { vehicles, loading: loadingVehicles } = useVehicles({ operatorId: operator?.id });
  const { ticketTypes, loading: loadingTickets } = useTickets({ operator: operator?.id });

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  const { width } = useWindowDimensions();

  let cardWidth = (display === 'cards' ? 338 : 550) + 32;
  cardWidth = cardWidth > width ? width - 32 : cardWidth;
  const numColumns = Math.floor(width / cardWidth) || 1;
  const contentWidth = cardWidth * numColumns;

  const canUpdateOperator = useRestriction(Permission.UpdateOperator);

  const initialLoading = !operator || (!manifest?.loads?.length && manifest?.loading);

  const data = React.useMemo(
    () =>
      [
        !loadingVehicles &&
          (!ticketTypes?.length || !vehicles?.length) &&
          canUpdateOperator &&
          setupVehiclesCardFragment,
        !loadingTickets &&
          (!ticketTypes?.length || !vehicles?.length) &&
          canUpdateOperator &&
          setupTicketsCardFragment,
        !initialLoading &&
        (!currentUser?.hasBodyMassKg ||
          !currentUser?.hasCertificationLevel ||
          !currentUser.user?.name)
          ? setupProfileCardFragment
          : null,
        ...(initialLoading ? new Array(5).fill(loadingFragment) : manifest.loads),
      ].filter(Boolean),
    [
      loadingVehicles,
      ticketTypes?.length,
      vehicles?.length,
      canUpdateOperator,
      loadingTickets,
      initialLoading,
      currentUser?.hasBodyMassKg,
      currentUser?.hasCertificationLevel,
      currentUser?.user?.name,
      manifest.loads,
    ]
  );

  const renderItem = React.useCallback(
    ({ item: load, index }: { item: LoadDetailsFragment; index: number }) => {
      // 1 means loading, because null and undefined
      // get filtered out
      if (load.id === '__LOADING__') {
        return display === 'list' ? (
          <LoadingCardLarge key={`loading-card-${index}`} />
        ) : (
          <LoadingCardSmall key={`loading-card-${index}`} />
        );
      }

      if (load.id === '__SETUP_PROFILE_CARD__') {
        return <SetupProfileCard />;
      }

      if (load.id === '__SETUP_VEHICLE_CARD__') {
        return (
          <SetupStepCard
            title={t('common:legacy.setup.addVehicle', {
              vehicle: t('terms:vehicle', { count: 1 }).toLowerCase(),
            })}
            completed={!!vehicles?.length}
            onPress={sheets.vehicle.open}
            index={1}
          />
        );
      }

      if (load.id === '__SETUP_TICKETS_CARD__') {
        return (
          <SetupStepCard
            title={t('common:legacy.setup.addTicket', {
              ticket: t('terms:ticket', { count: 1 }).toLowerCase(),
            })}
            completed={!!ticketTypes?.length}
            onPress={sheets.ticketType.open}
            index={2}
          />
        );
      }
      return display === 'list' ? (
        <LoadCardLarge
          controlsVisible={false}
          key={`load-${load?.id}`}
          id={load?.id}
          onSlotPress={(slot) => {
            if (load) {
              dialogs.manifestUser.open({
                load,
                slot: { ...(slot || {}), membership: slot ? slot?.membership : currentUser },
              });
            }
          }}
          onSlotGroupPress={(slots) => dialogs.manifestGroup.open({ load, slots })}
          onManifest={() => {
            dialogs.manifestUser.open({ load, slot: { membership: currentUser } });
          }}
          onManifestGroup={() => dialogs.manifestGroup.open({ load })}
        />
      ) : (
        <LoadCardSmall
          key={`load-${load?.id}`}
          id={load?.id}
          onPress={() =>
            navigation.navigate('Authenticated', {
              screen: 'Manifest',
              params: {
                screen: 'LoadScreen',
                params: { loadId: load?.id },
              },
            })
          }
        />
      );
    },
    [
      display,
      t,
      vehicles?.length,
      sheets.vehicle.open,
      sheets.ticketType.open,
      ticketTypes?.length,
      dialogs.manifestUser,
      dialogs.manifestGroup,
      currentUser,
      navigation,
    ]
  );
  return (
    <ScreenContainer edges={['bottom']}>
      <ProgressBar visible={loading || manifest.loading} indeterminate />

      <View style={styles.container}>
        {operator?.banner && (
          <ImageBackground
            source={{ uri: operator.banner }}
            style={{ position: 'absolute', top: -8, left: 0, width: '100%', height: 340 }}
            resizeMode="cover"
          />
        )}
        <DragDropWrapper>
          <FlatList<LoadDetailsFragment>
            ListHeaderComponent={() => (
              <>
                <DateBar />
                {hasWindsAloft(operator?.modules) ? <WeatherConditions /> : null}
                <ManifestDeskNote />
              </>
            )}
            ListEmptyComponent={() => (
              <NoResults
                style={{ marginTop: 156 }}
                title={manifest.isToday ? 'No loads so far today' : 'No loads on this day'}
                subtitle={
                  manifest.isToday ? "How's the weather?" : 'Create a load to schedule it ahead'
                }
              />
            )}
            style={styles.list}
            testID="loads"
            keyExtractor={(item, idx) => `load-small-${item?.id || idx}-${idx}`}
            key={`loads-columns-${numColumns}`}
            contentContainerStyle={{
              width: contentWidth,
              alignSelf: 'center',
              // Room for the floating button below the last load
              paddingBottom: 96,
            }}
            numColumns={numColumns}
            {...{ data, renderItem }}
            refreshControl={
              <RefreshControl
                refreshing={manifest.refreshing}
                onRefresh={() => manifest.refetch()}
              />
            }
          />
        </DragDropWrapper>
      </View>
      {manifest.permissions.canCreateLoad && (
        <FloatingActionArea>
          <Button
            testID="new-load-primary-action"
            icon="plus"
            label="New load"
            onPress={() => dialogs.load.open({})}
          />
        </FloatingActionArea>
      )}
      <View style={styles.header}>
        <Menu
          label={t('common:legacy.setup.display')}
          trigger={<IconButton icon="cog-outline" aria-label={t('common:legacy.setup.display')} />}
          items={[
            {
              label: t('common:legacy.setup.expanded'),
              selected: display !== 'cards',
              onPress: () => setDisplay('list'),
            },
            {
              label: t('common:legacy.setup.compact'),
              selected: display === 'cards',
              onPress: () => setDisplay('cards'),
            },
          ]}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  list: {
    flex: 1,
    paddingTop: 35,
  },
  header: {
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    padding: 0,
    width: '100%',
    position: 'absolute',
    top: 0,
    backgroundColor: 'transparent',
  },
});
