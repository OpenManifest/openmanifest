import { useIsFocused, useNavigation } from '@react-navigation/core';
import * as React from 'react';
import {
  Dimensions,
  ImageBackground,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { FAB, IconButton, ProgressBar, useTheme } from 'react-native-paper';
import checkDropzoneSetupComplete from 'app/utils/checkDropzoneSetupComplete';

import NoResults from 'app/components/NoResults';
import { View } from 'app/components/Themed';
import { DropzoneState, LoadState, Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import LoadDialog from 'app/components/dialogs/Load';
import { useDropzoneContext } from 'app/api/crud/useDropzone';
import { LoadDetailsFragment } from 'app/api/operations';
import Menu, { MenuItem } from 'app/components/popover/Menu';

import { useManifestContext } from 'app/api/crud/useManifest';
import DragDropWrapper from '../../../../components/slots_table/DragAndDrop/DragDropSlotProvider';
import GetStarted from '../../../../components/GetStarted';
import LoadCardSmall from './LoadCard/Small/Card';
import LoadCardLarge from './LoadCard/Large/Card';
import WeatherConditions from './Weather/WeatherBoard';
import LoadingCardLarge from './LoadCard/Large/Loading';
import LoadingCardSmall from './LoadCard/Small/Loading';
import SetupProfileCard from './SetupProfileCard';

const loadingFragment: LoadDetailsFragment = {
  id: '__LOADING__',
  availableSlots: 0,
  createdAt: '',
  isFull: false,
  isOpen: false,
  loadNumber: 0,
  maxSlots: 0,
  occupiedSlots: 0,
  plane: {
    id: '__LOADING__',
    maxSlots: 0,
  },
  state: LoadState.Open,
  weight: 0,
};

const setupProfileCardFragment = { ...loadingFragment, id: '__SETUP_PROFILE_CARD__' };
export default function ManifestScreen() {
  const state = useAppSelector((root) => root.global);
  const forms = useAppSelector((root) => root.forms);
  const manifestScreen = useAppSelector((root) => root.screens.manifest);
  const setup = useAppSelector((root) => root.screens.dropzoneWizard);
  const dispatch = useAppDispatch();
  const [isDisplayOptionsOpen, setDisplayOptionsOpen] = React.useState(false);
  const [isSetupCheckComplete] = React.useState(false);
  const { dropzone, currentUser, loading, refetch, fetchMore } = useDropzoneContext();
  const manifest = useManifestContext();

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const canUpdateDropzone = useRestriction(Permission.UpdateDropzone);

  React.useEffect(() => {
    if (dropzone && isFocused && canUpdateDropzone) {
      const dropzoneWizardIndex = checkDropzoneSetupComplete(dropzone);
      console.debug({ dropzoneWizardIndex });

      if (dropzoneWizardIndex) {
        dispatch(actions.screens.dropzoneWizard.setIndex(dropzoneWizardIndex));
        dispatch(actions.forms.dropzone.setOriginal(dropzone));
        if (dropzone?.planes?.length) {
          dispatch(actions.forms.plane.setOriginal(dropzone.planes[0]));
        }
        if (dropzone?.ticketTypes?.length) {
          dispatch(actions.forms.ticketType.setOriginal(dropzone.ticketTypes[0]));
        }
        navigation.navigate('Wizards', { screen: 'DropzoneWizardScreen' });
      }
    }
  }, [
    dispatch,
    dropzone,
    isFocused,
    navigation,
    setup.completed,
    isSetupCheckComplete,
    canUpdateDropzone,
  ]);

  React.useEffect(() => {
    if (isFocused && dropzone?.name) {
      navigation.setOptions({
        title: dropzone.name,
      });
    }
  }, [isFocused, dropzone?.name, navigation]);

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  const hasPlanes = !!dropzone?.planes?.length;
  const hasTicketTypes = !!dropzone?.ticketTypes?.length;
  const isPublic = dropzone?.status === DropzoneState.Public;
  const isSetupComplete = hasPlanes && hasTicketTypes;

  React.useEffect(() => {
    if (dropzone?.primaryColor && dropzone?.primaryColor !== state.theme?.colors?.primary) {
      dispatch(actions.global.setPrimaryColor(dropzone.primaryColor));
    }

    if (dropzone?.secondaryColor && dropzone?.secondaryColor !== state.theme?.colors?.accent) {
      // dispatch(actions.global.setAccentColor(dropzone.secondaryColor));
      console.log('Accent color disabled');
    }
  }, [
    dispatch,
    dropzone?.primaryColor,
    dropzone?.secondaryColor,
    state.theme?.colors?.accent,
    state.theme?.colors?.primary,
  ]);

  const { width } = useWindowDimensions();

  let cardWidth = (manifestScreen.display === 'cards' ? 338 : 550) + 32;
  cardWidth = cardWidth > width ? width - 32 : cardWidth;
  const numColumns = Math.floor(width / cardWidth) || 1;
  const contentWidth = cardWidth * numColumns;

  const initialLoading = !dropzone || (!manifest?.loads?.length && manifest?.loading);

  const theme = useTheme();

  const data = React.useMemo(
    () =>
      [
        !initialLoading &&
        (!currentUser?.hasExitWeight || !currentUser?.hasLicense || !currentUser.user?.name)
          ? setupProfileCardFragment
          : null,
        ...(initialLoading ? new Array(5).fill(loadingFragment) : manifest.loads),
      ].filter(Boolean),
    [
      manifest?.loads,
      currentUser?.hasExitWeight,
      currentUser?.hasLicense,
      currentUser?.user?.name,
      initialLoading,
    ]
  );

  const renderItem = React.useCallback(
    ({ item: load, index }: { item: LoadDetailsFragment; index: number }) => {
      // 1 means loading, because null and undefined
      // get filtered out
      if (load.id === '__LOADING__') {
        return manifestScreen.display === 'list' ? (
          <LoadingCardLarge key={`loading-card-${index}`} />
        ) : (
          <LoadingCardSmall key={`loading-card-${index}`} />
        );
      }

      if (load.id === '__SETUP_PROFILE_CARD__') {
        return <SetupProfileCard />;
      }
      return manifestScreen.display === 'list' ? (
        <LoadCardLarge
          controlsVisible={false}
          key={`load-${load?.id}`}
          id={load?.id}
          onSlotPress={(slot) => {
            if (load) {
              manifest.dialogs.user.open(load, slot);
            }
          }}
          onSlotGroupPress={(slots) => {
            dispatch(actions.forms.manifestGroup.reset());
            dispatch(actions.forms.manifestGroup.setFromSlots({ load, slots }));
            dispatch(actions.forms.manifestGroup.setField(['load', load]));
            // FIXME: Open manifest group drawer
          }}
          onManifest={() => {
            manifest.dialogs.user.open(load);
          }}
          onManifestGroup={() => {
            dispatch(actions.forms.manifestGroup.reset());
            dispatch(actions.forms.manifestGroup.setOpen(true));
            dispatch(actions.forms.manifestGroup.setField(['load', load]));
          }}
        />
      ) : (
        <LoadCardSmall
          key={`load-${load?.id}`}
          id={load?.id}
          onPress={() =>
            navigation.navigate('Authenticated', {
              screen: 'LeftDrawer',
              params: {
                screen: 'Manifest',
                params: {
                  screen: 'LoadScreen',
                  params: { loadId: load?.id },
                },
              },
            })
          }
        />
      );
    },
    [dispatch, manifest.dialogs.user, manifestScreen.display, navigation]
  );
  return (
    <View style={{ flex: 1 }}>
      <ProgressBar
        visible={loading || manifest.loading}
        indeterminate
        color={state.theme.colors.primary}
      />

      <View style={styles.container}>
        {!initialLoading && !isSetupComplete ? (
          <GetStarted {...{ hasPlanes, hasTicketTypes, isPublic }} />
        ) : (
          <View
            style={{
              width: '100%',
              flex: 1,
              height: Dimensions.get('window').height,
              backgroundColor: theme.colors.background,
            }}
          >
            {dropzone?.banner && (
              <ImageBackground
                source={{ uri: dropzone.banner }}
                style={{ position: 'absolute', top: -8, left: 0, width: '100%', height: 340 }}
                resizeMode="cover"
              />
            )}
            <DragDropWrapper>
              <FlatList<LoadDetailsFragment>
                ListHeaderComponent={() => <WeatherConditions />}
                ListEmptyComponent={() => (
                  <NoResults
                    style={{ marginTop: 156 }}
                    title="No loads so far today"
                    subtitle="How's the weather?"
                  />
                )}
                style={{
                  paddingTop: 35,
                  flex: 1,
                  height: Dimensions.get('window').height,
                }}
                testID="loads"
                keyExtractor={(item, idx) => `load-small-${item?.id || idx}-${idx}`}
                key={`loads-columns-${numColumns}`}
                contentContainerStyle={{
                  width: contentWidth,
                  alignSelf: 'center',
                  paddingBottom: 100,
                }}
                numColumns={numColumns}
                {...{ data, renderItem }}
                refreshControl={
                  <RefreshControl refreshing={loading} onRefresh={() => fetchMore()} />
                }
              />
            </DragDropWrapper>
          </View>
        )}
        {manifest.permissions.canCreateLoad && isSetupComplete && (
          <FAB
            style={[styles.fab, { backgroundColor: theme.colors.primary }]}
            small
            icon="plus"
            onPress={() => dispatch(actions.forms.load.setOpen(true))}
            label="New load"
          />
        )}
      </View>
      <View style={styles.header}>
        <Menu
          open={isDisplayOptionsOpen}
          setOpen={setDisplayOptionsOpen}
          anchor={<IconButton icon="cog-outline" onPress={() => setDisplayOptionsOpen(true)} />}
        >
          <MenuItem
            title="Show expanded cards"
            bold={manifestScreen.display !== 'cards'}
            onPress={() => {
              dispatch(actions.screens.manifest.setDisplayStyle('list'));
              setDisplayOptionsOpen(false);
            }}
          />
          <MenuItem
            title="Show compact cards"
            bold={manifestScreen.display === 'cards'}
            onPress={() => {
              dispatch(actions.screens.manifest.setDisplayStyle('cards'));
              setDisplayOptionsOpen(false);
            }}
          />
        </Menu>
      </View>

      <LoadDialog
        onSuccess={() => {
          dispatch(actions.forms.load.setOpen(false));
          refetch();
        }}
        open={forms.load.open}
        onClose={() => dispatch(actions.forms.load.setOpen(false))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
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
