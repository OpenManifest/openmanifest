import { useIsFocused, useNavigation } from '@react-navigation/core';
import * as React from 'react';
import { Dimensions, RefreshControl, StyleSheet, useWindowDimensions } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { FAB, IconButton, Menu, ProgressBar, useTheme } from 'react-native-paper';

import NoResults from '../../../components/NoResults';
import { View } from '../../../components/Themed';
import { Load, Permission } from '../../../api/schema.d';
import useRestriction from '../../../hooks/useRestriction';
import { actions, useAppDispatch, useAppSelector } from '../../../state';
import GetStarted from './GetStarted';
import LoadCardSmall from './LoadCard/Small/Card';
import LoadCardLarge from './LoadCard/Large/Card';
import LoadDialog from '../../../components/dialogs/Load';
import useCurrentDropzone from '../../../api/hooks/useCurrentDropzone';
import WeatherConditions from './Weather/WeatherBoard';
import LoadingCardLarge from './LoadCard/Large/Loading';
import LoadingCardSmall from './LoadCard/Small/Loading';

export default function ManifestScreen() {
  const state = useAppSelector((root) => root.global);
  const forms = useAppSelector((root) => root.forms);
  const manifestScreen = useAppSelector((root) => root.screens.manifest);
  const dispatch = useAppDispatch();
  const [isDisplayOptionsOpen, setDisplayOptionsOpen] = React.useState(false);
  const { dropzone, currentUser, loading, refetch, fetchMore } = useCurrentDropzone();

  const navigation = useNavigation();
  const isFocused = useIsFocused();

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
      dispatch(actions.global.setPrimaryColor(dropzone.secondaryColor));
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
    (load: Load) => {
      if (!currentUser?.hasLicense) {
        return dispatch(
          actions.notifications.showSnackbar({
            message: 'You need to select a license on your user profile',
            variant: 'warning',
          })
        );
      }

      if (!currentUser?.hasMembership) {
        return dispatch(
          actions.notifications.showSnackbar({
            message: 'Your membership is out of date',
            variant: 'warning',
          })
        );
      }

      if (!currentUser?.hasRigInspection) {
        return dispatch(
          actions.notifications.showSnackbar({
            message: 'Your rig needs to be inspected before manifesting',
            variant: 'warning',
          })
        );
      }

      if (!currentUser?.hasReserveInDate) {
        return dispatch(
          actions.notifications.showSnackbar({
            message: 'Your rig needs a reserve repack',
            variant: 'warning',
          })
        );
      }

      if (!currentUser?.hasExitWeight) {
        return dispatch(
          actions.notifications.showSnackbar({
            message: 'Update your exit weight on your profile before manifesting',
            variant: 'warning',
          })
        );
      }

      if (!currentUser?.hasCredits) {
        return dispatch(
          actions.notifications.showSnackbar({
            message: 'You have no credits on your account',
            variant: 'warning',
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

  let cardWidth = (manifestScreen.display === 'cards' ? 335 : 550) + 32;
  cardWidth = cardWidth > width ? width - 32 : cardWidth;
  const numColumns = Math.floor(width / cardWidth) || 1;
  const contentWidth = cardWidth * numColumns;

  const loads = dropzone?.loads?.edges || [];
  const initialLoading = !loads?.length && loading;

  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ProgressBar visible={loading} indeterminate color={state.theme.colors.accent} />

      <View style={styles.container}>
        {!initialLoading && !isSetupComplete ? (
          <GetStarted {...{ hasPlanes, hasTicketTypes, isPublic }} />
        ) : (
          <View
            style={{
              width: '100%',
              flex: 1,
              height: Dimensions.get('window').height,
            }}
          >
            <FlatList
              ListHeaderComponent={() => <WeatherConditions />}
              ListEmptyComponent={() => (
                <NoResults title="No loads so far today" subtitle="How's the weather?" />
              )}
              style={{
                paddingTop: 35,
                flex: 1,
                height: Dimensions.get('window').height,
                backgroundColor: theme.colors.background,
              }}
              testID="loads"
              keyExtractor={({ item }, idx) => `load-small-${item?.node?.id || idx}`}
              key={`loads-columns-${numColumns}`}
              contentContainerStyle={{
                width: contentWidth,
                alignSelf: 'center',
                paddingBottom: 100,
                backgroundColor: theme.colors.background,
              }}
              numColumns={numColumns}
              data={initialLoading ? [1, 1, 1, 1, 1] : loads}
              refreshControl={
                <RefreshControl refreshing={loading} onRefresh={() => fetchMore({})} />
              }
              renderItem={({ item: edge, index }) => {
                // 1 means loading, because null and undefined
                // get filtered out
                if (edge === 1) {
                  return manifestScreen.display === 'list' ? (
                    <LoadingCardLarge key={`loading-card-${index}`} />
                  ) : (
                    <LoadingCardSmall key={`loading-card-${index}`} />
                  );
                }
                return manifestScreen.display === 'list' ? (
                  <LoadCardLarge
                    controlsVisible={false}
                    key={`load-${edge.node.id}`}
                    load={edge.node}
                    onSlotPress={(slot) => {
                      if (edge?.node) {
                        dispatch(actions.forms.manifest.setOpen(slot));
                        dispatch(actions.forms.manifest.setField(['load', edge.node]));
                      }
                    }}
                    onSlotGroupPress={(slots) => {
                      dispatch(actions.forms.manifestGroup.reset());
                      dispatch(actions.forms.manifestGroup.setFromSlots(slots));
                      dispatch(actions.forms.manifestGroup.setField(['load', edge.node]));
                      navigation.navigate('ManifestGroupScreen');
                    }}
                    onManifest={() => {
                      onManifest(edge.node);
                    }}
                    onManifestGroup={() => {
                      dispatch(actions.forms.manifestGroup.reset());
                      dispatch(actions.forms.manifestGroup.setOpen(true));
                      dispatch(actions.forms.manifestGroup.setField(['load', edge.node]));
                    }}
                  />
                ) : (
                  <LoadCardSmall
                    key={`load-${edge.node.id}`}
                    load={edge.node}
                    onPress={() => navigation.navigate('LoadScreen', { load: edge.node })}
                  />
                );
              }}
            />
          </View>
        )}
        {canCreateLoad && isSetupComplete && (
          <FAB
            style={styles.fab}
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
