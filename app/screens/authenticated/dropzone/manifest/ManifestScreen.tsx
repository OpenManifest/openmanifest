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
import { FAB, IconButton, Menu, ProgressBar, useTheme } from 'react-native-paper';
import checkDropzoneSetupComplete from 'app/utils/checkDropzoneSetupComplete';

import NoResults from 'app/components/NoResults';
import { View } from 'app/components/Themed';
import { LoadState, Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import LoadDialog from 'app/components/dialogs/Load';
import useCurrentDropzone from 'app/api/hooks/useCurrentDropzone';
import { LoadDetailsFragment } from 'app/api/operations';
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
  createdAt: 0,
  isFull: false,
  isOpen: false,
  loadNumber: 0,
  maxSlots: 0,
  occupiedSlots: 0,
  plane: {
    id: '__LOADING__',
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
  const { dropzone, currentUser, loading, refetch, fetchMore } = useCurrentDropzone();

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const canUpdateDropzone = useRestriction(Permission.UpdateDropzone);

  React.useEffect(() => {
    if (dropzone && isFocused && canUpdateDropzone) {
      const dropzoneWizardIndex = checkDropzoneSetupComplete(dropzone);
      console.log({ dropzoneWizardIndex });

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
  const isPublic = !!dropzone?.isPublic;
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

  const canCreateLoad = useRestriction(Permission.CreateLoad);

  const onManifest = React.useCallback(
    (load: LoadDetailsFragment) => {
      if (!currentUser?.hasLicense) {
        return dispatch(
          actions.notifications.showSnackbar({
            message: 'You need to select a license on your user profile',
            variant: 'info',
          })
        );
      }

      if (!currentUser?.hasMembership) {
        return dispatch(
          actions.notifications.showSnackbar({
            message: 'Your membership is out of date',
            variant: 'info',
          })
        );
      }

      if (!currentUser?.hasRigInspection) {
        return dispatch(
          actions.notifications.showSnackbar({
            message: 'Your rig needs to be inspected before manifesting',
            variant: 'info',
          })
        );
      }

      if (!currentUser?.hasReserveInDate) {
        return dispatch(
          actions.notifications.showSnackbar({
            message: 'Your rig needs a reserve repack',
            variant: 'info',
          })
        );
      }

      if (!currentUser?.hasExitWeight) {
        return dispatch(
          actions.notifications.showSnackbar({
            message: 'Update your exit weight on your profile before manifesting',
            variant: 'info',
          })
        );
      }

      if (!currentUser?.hasCredits) {
        return dispatch(
          actions.notifications.showSnackbar({
            message: 'You have no credits on your account',
            variant: 'info',
          })
        );
      }

      dispatch(actions.forms.manifest.setOpen(true));
      dispatch(actions.forms.manifest.setField(['dropzoneUser', currentUser]));
      dispatch(actions.forms.manifest.setField(['load', load]));
      return null;
    },
    [currentUser, dispatch]
  );

  const { width } = useWindowDimensions();

  let cardWidth = (manifestScreen.display === 'cards' ? 338 : 550) + 32;
  cardWidth = cardWidth > width ? width - 32 : cardWidth;
  const numColumns = Math.floor(width / cardWidth) || 1;
  const contentWidth = cardWidth * numColumns;

  const loads: LoadDetailsFragment[] = React.useMemo(
    () => (dropzone?.loads?.edges?.map((edge) => edge?.node) as LoadDetailsFragment[]) || [],
    [dropzone?.loads?.edges]
  );
  const initialLoading = !loads?.length && loading;
  console.log({ initialLoading });

  const theme = useTheme();

  const data = React.useMemo(
    () =>
      [
        !currentUser?.hasExitWeight || !currentUser?.hasLicense || !currentUser.user?.name
          ? setupProfileCardFragment
          : null,
        ...(initialLoading ? new Array(5).fill(loadingFragment) : loads),
      ].filter(Boolean),
    [
      currentUser?.hasExitWeight,
      currentUser?.hasLicense,
      currentUser?.user?.name,
      initialLoading,
      loads,
    ]
  );

  const renderItem = React.useCallback(
    ({ item: load, index }: { item: LoadDetailsFragment; index: number }) => {
      // 1 means loading, because null and undefined
      // get filtered out
      console.log('CARDID', load.id);
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
          load={load}
          onSlotPress={(slot) => {
            if (load) {
              dispatch(actions.forms.manifest.setOpen(slot));
              dispatch(actions.forms.manifest.setField(['load', load]));
            }
          }}
          onSlotGroupPress={(slots) => {
            dispatch(actions.forms.manifestGroup.reset());
            dispatch(actions.forms.manifestGroup.setFromSlots({ load, slots }));
            dispatch(actions.forms.manifestGroup.setField(['load', load]));
            // FIXME: Open manifest group drawer
          }}
          onManifest={() => {
            onManifest(load);
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
          load={load}
          onPress={() =>
            navigation.navigate('Authenticated', {
              screen: 'Drawer',
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
    [dispatch, manifestScreen.display, navigation, onManifest]
  );
  return (
    <View style={{ flex: 1 }}>
      <ProgressBar visible={loading} indeterminate color={state.theme.colors.primary} />

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
                <RefreshControl refreshing={loading} onRefresh={() => fetchMore({})} />
              }
            />
          </View>
        )}
        {canCreateLoad && isSetupComplete && (
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
          anchor={<IconButton icon="cog-outline" onPress={() => setDisplayOptionsOpen(true)} />}
          visible={isDisplayOptionsOpen}
          onDismiss={() => setDisplayOptionsOpen(false)}
        >
          <Menu.Item
            title="Show expanded cards"
            titleStyle={{
              fontWeight: manifestScreen.display === 'cards' ? 'normal' : 'bold',
            }}
            onPress={() => {
              dispatch(actions.screens.manifest.setDisplayStyle('list'));
              setDisplayOptionsOpen(false);
            }}
          />
          <Menu.Item
            title="Show compact cards"
            titleStyle={{
              fontWeight: manifestScreen.display === 'list' ? 'normal' : 'bold',
            }}
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
