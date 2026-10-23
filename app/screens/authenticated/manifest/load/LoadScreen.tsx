import * as React from 'react';
import { FlatList, Platform, View } from 'react-native';

import { RouteProp, useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { SlotDetailsFragment } from 'app/api/operations';
import {
  LoadContextProvider,
  useLoadContext,
  useManifestContext,
  useOperatorContext,
} from 'app/providers';
import LoadCrewChips from 'app/components/chips/LoadCrewChips';
import VehicleChip from 'app/components/chips/VehicleChip';

import { LoadState, Permission } from 'app/api/schema.d';

import useRestriction from 'app/hooks/useRestriction';
import { Divider } from 'react-native-paper';
import { useNotifications } from 'app/providers/notifications';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import ManifestDeskNote from 'app/components/ManifestDeskNote';
import ActionButton from './ActionButton';
import Header from './Header';
import InfoGrid from './InfoGrid';
import TableView from './views/TableView';
import { useAppTheme } from 'app/theme';

export type LoadScreenRoute = {
  LoadScreen: {
    loadId: string;
  };
};
/**
 *
 *
 * @returns
 */
function LoadScreen() {
  const [isExpanded, setExpanded] = React.useState(false);
  const { palette, theme } = useAppTheme();

  const {
    manifest: { deleteSlot },
    dialogs,
  } = useManifestContext();
  const {
    load: { load, loading, refetch, updateCrew, updateVehicle },
  } = useLoadContext();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { t } = useTranslation(['common', 'terms']);

  // The header reads "Load #12" once the number is known
  React.useEffect(() => {
    if (load?.loadNumber) {
      navigation.setOptions({
        title: t('common:loadNumber', {
          load: t('terms:load', { count: 1 }),
          number: load.loadNumber,
        }),
      });
    }
  }, [load?.loadNumber, navigation, t]);

  React.useEffect(() => {
    if (load?.maxSlots && load?.maxSlots < 5 && !isExpanded) {
      setExpanded(true);
    }
  }, [isExpanded, load?.maxSlots]);

  const { operator: currentOperator } = useOperatorContext();
  const { currentUser } = currentOperator;

  const canEditSelf = useRestriction(Permission.UpdateSlot);
  const canEditOthers = useRestriction(Permission.UpdateUserSlot);
  const maxSlots = load?.maxSlots || 0;
  const occupiedSlots = load?.occupiedSlots || 0;
  const notify = useNotifications();

  const onDeleteSlot = React.useCallback(
    async (slot: SlotDetailsFragment) => {
      const response = await deleteSlot({
        id: Number(slot.id),
      });

      if ('error' in response && response.error) {
        notify.error(
          response?.error ||
            `${slot.membership?.user?.name} could not be taken off load #${load?.loadNumber}`
        );
      } else if ('slot' in response && slot?.id) {
        notify.error(
          `${response.slot?.membership?.user?.name || 'User'} has been taken off load #${
            load?.loadNumber
          }`
        );
      }
    },
    [deleteSlot, load?.loadNumber, notify]
  );

  const onSlotPress = React.useCallback(
    (slot: SlotDetailsFragment) => {
      if (!load) {
        return;
      }
      // `updateSlot` is for a member's own slot, `updateUserSlot` for other people's (as the API checks it)
      const isOwnSlot = slot.membership?.id === currentUser?.id;
      if (!(isOwnSlot ? canEditSelf : canEditOthers)) {
        return;
      }

      const slotGroup = load.slots?.filter(
        ({ groupNumber }) => groupNumber && groupNumber === slot.groupNumber
      );
      if (slotGroup?.length || Platform.OS === 'web') {
        dialogs.manifestGroup.open({ load, slots: slotGroup?.length ? slotGroup : [slot] });
      } else {
        dialogs.manifestUser.open({ load, slot });
      }
    },
    [canEditOthers, canEditSelf, currentUser?.id, dialogs.manifestGroup, dialogs.manifestUser, load]
  );

  const onSlotGroupPress = React.useCallback(
    (slotGroup: SlotDetailsFragment[]) => {
      if (load) {
        dialogs.manifestGroup.open({ load, slots: slotGroup });
      }
    },
    [dialogs.manifestGroup, load]
  );

  const onAvailableSlotPress = React.useCallback(() => {
    if (load) {
      dialogs.manifestGroup.open({ load });
    }
  }, [dialogs.manifestGroup, load]);

  // The header scrolls with the rows: the slots list is the only scroll container of the screen
  const header = (
    <>
      <Header
        load={load || undefined}
        renderBadges={() => (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginVertical: 8 }}
            data={['vehicle', 'crew']}
            keyExtractor={(item) => item.toString()}
            renderItem={({ item }) => {
              switch (item) {
                case 'vehicle':
                  return (
                    <VehicleChip
                      value={load?.vehicle}
                      onSelect={async (vehicle) => {
                        if ((load?.slots?.length || 0) > (vehicle.capacity || 0)) {
                          const diff = (load?.slots?.length || 0) - (vehicle.capacity || 0);

                          notify.info(
                            `You need to take ${diff} people off the load to fit on this plane`
                          );
                        } else {
                          await updateVehicle(vehicle);
                          refetch();
                        }
                      }}
                      small
                      backgroundColor="transparent"
                      color={palette.onSurface}
                    />
                  );
                default:
                  return (
                    <View style={{ flexDirection: 'row' }}>
                      <LoadCrewChips
                        load={load}
                        onSelect={updateCrew}
                        small
                        backgroundColor="transparent"
                        color={palette.onSurface}
                      />
                    </View>
                  );
              }
            }}
          />
        )}
      >
        <InfoGrid
          items={[
            {
              title: 'Status',
              value: {
                [LoadState.Open]: 'Open',
                [LoadState.Boarding]: 'On call',
                [LoadState.Cancelled]: 'Cancelled',
                [LoadState.Departed]: 'In air',
                [LoadState.Completed]: 'Completed',
              }[load?.state || LoadState.Open],
            },
            { title: 'Slots', value: `${occupiedSlots}/${maxSlots}` },
            {
              title: 'Weight',
              value: `${load?.weight || 0}kg`,
            },
          ]}
        />
      </Header>
      <ManifestDeskNote />
      <Divider />
    </>
  );

  return (
    <ScreenContainer edges={['bottom']}>
      <TableView
        ListHeaderComponent={header}
        {...{
          slots: load?.slots?.filter(Boolean) || [],
          load,
          loading,
          refetch,
          onSlotPress,
          onDeletePress: onDeleteSlot,
          onSlotGroupPress,
          onAvailableSlotPress,
        }}
      />
      {load && isFocused ? <ActionButton load={load} /> : null}
    </ScreenContainer>
  );
}

export default function LoadScreenWrapper() {
  const route = useRoute<RouteProp<LoadScreenRoute>>();
  const loadId = route?.params?.loadId;

  return (
    <LoadContextProvider id={loadId}>
      <LoadScreen />
    </LoadContextProvider>
  );
}
