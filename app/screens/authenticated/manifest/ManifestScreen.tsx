import { useIsFocused, useNavigation } from '@react-navigation/core';
import * as React from 'react';
import { Dimensions, RefreshControl, StyleSheet, useWindowDimensions } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { FAB, IconButton, Menu, ProgressBar, ToggleButton } from 'react-native-paper';
import ManifestUserSheet from '../../../components/dialogs/ManifestUser/ManifestUser';
import ManifestGroupSheet from '../../../components/dialogs/ManifestGroup/ManifestGroup';

import NoResults from '../../../components/NoResults';
import { View } from '../../../components/Themed';
import { Load, Permission } from '../../../graphql/schema.d';
import useRestriction from '../../../hooks/useRestriction';
import { actions, useAppDispatch, useAppSelector } from '../../../redux';
import GetStarted from './GetStarted';
import LoadCardSmall from './LoadCard/Small/Card';
import LoadCardLarge from './LoadCard/Large/Card';
import LoadDialog from '../../../components/dialogs/Load';
import useCurrentDropzone from '../../../graphql/hooks/useCurrentDropzone';
import WeatherConditions from './Weather/WeatherBoard';
import LoadingCard from './LoadCard/Small/Loading';
export default function ManifestScreen() {
  const state = useAppSelector(state => state.global);
  const forms = useAppSelector(state => state.forms);
  const manifestScreen = useAppSelector(state => state.screens.manifest);
  const dispatch = useAppDispatch();
  const [isDisplayOptionsOpen, setDisplayOptionsOpen] = React.useState(false);
  const { dropzone, currentUser, loading, refetch, fetchMore } = useCurrentDropzone();

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused]);

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
    dropzone?.primaryColor,
    dropzone?.secondaryColor
  ])

  const canCreateLoad = useRestriction(Permission.CreateLoad);

  const onManifest = React.useCallback((load: Load) => {
    
    if (!currentUser?.hasLicense) {
      return dispatch(
        actions.notifications.showSnackbar({
          message: "You need to select a license on your user profile",
          variant: "warning"
        })
      );
    }

    if (!currentUser?.hasMembership) {
      return dispatch(
        actions.notifications.showSnackbar({
          message: "Your membership is out of date",
          variant: "warning"
        })
      );
    }

    if (!currentUser?.hasRigInspection) {
      return dispatch(
        actions.notifications.showSnackbar({
          message: "Your rig needs to be inspected before manifesting",
          variant: "warning"
        })
      );
    }

    if (!currentUser?.hasReserveInDate) {
      return dispatch(
        actions.notifications.showSnackbar({
          message: "Your rig needs a reserve repack",
          variant: "warning"
        })
      );
    }

    if (!currentUser?.hasExitWeight) {
      return dispatch(
        actions.notifications.showSnackbar({
          message: "Update your exit weight on your profile before manifesting",
          variant: "warning"
        })
      );
    }

    if (!currentUser?.hasCredits) {
      return dispatch(
        actions.notifications.showSnackbar({
          message: "You have no credits on your account",
          variant: "warning"
        })
      );
    }

    dispatch(actions.forms.manifest.setOpen(true));
    dispatch(
      actions.forms.manifest.setField(["dropzoneUser", currentUser])
    );
    dispatch(
      actions.forms.manifest.setField(["load", load])
    );
  }, [JSON.stringify(dropzone?.currentUser)]);


  const { width } = useWindowDimensions(); 

  const cardWidth = (manifestScreen.display === 'cards' ? 335 : 550) + 32;
  const numColumns = Math.floor(width / cardWidth) || 1;
  const contentWidth = (cardWidth * numColumns) - 16;

  return (
    <>
      <ProgressBar visible={loading} indeterminate color={state.theme.colors.accent} />
      
      <View style={styles.container}>
        {
          loading
          ? <LoadingCard />
          : (!isSetupComplete
              ? <GetStarted {...{ hasPlanes, hasTicketTypes, isPublic }}/>
                : <View style={{ width: "100%", flex: 1,  height: Dimensions.get("window").height }}>
                    
                    <FlatList
                      ListHeaderComponent={() => <WeatherConditions />}
                      ListEmptyComponent={() =>
                        <NoResults
                          title="No loads so far today"
                          subtitle="How's the weather?"
                        />
                      }
                      style={{
                        flex: 1,
                        paddingTop: 35,
                        height: Dimensions.get("window").height,
                        width: contentWidth,
                        alignSelf: 'center'
                      }}
                      testID="loads"
                      keyExtractor={(item) => `load-${item?.node?.id}`}
                      key={`loads-columns-${numColumns}`}
                      contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
                      numColumns={numColumns}
                      data={(dropzone?.loads?.edges || [])}
                      refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={() => fetchMore({ })} />
                      }
                      renderItem={({ item: edge, index }) =>
                        manifestScreen.display === "list" ? (
                          <LoadCardLarge
                            key={`load-${edge.node.id}`}
                            load={edge.node}
                            onSlotPress={(slot) => {
                              dispatch(actions.forms.manifest.setOpen(slot));
                              dispatch(
                                actions.forms.manifest.setField(["load", edge.node!])
                              );
                            }}
                            onSlotGroupPress={(slots) => {
                              dispatch(actions.forms.manifestGroup.reset());
                              dispatch(actions.forms.manifestGroup.setFromSlots(slots));
                              dispatch(actions.forms.manifestGroup.setField(["load", edge.node!]));
                              navigation.navigate("ManifestGroupScreen");
                            }}
                            onManifest={() => {
                              
                              onManifest(edge.node!)
                            }}
                            onManifestGroup={() => {
                              dispatch(actions.forms.manifestGroup.reset());
                              dispatch(actions.forms.manifestGroup.setOpen(true));
                              dispatch(actions.forms.manifestGroup.setField(["load", edge.node!]));
                            }}
                          />) : (
                            <LoadCardSmall
                              key={`load-${edge.node.id}`}
                              load={edge.node}
                              onPress={() => navigation.navigate("LoadScreen", { load: edge.node })}
                            />
                          )
                      }
                    />
                </View>
        )}
        { canCreateLoad && isSetupComplete && (
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
          anchor={
            <IconButton icon="cog-outline" onPress={() => setDisplayOptionsOpen(true)} />
          }
          visible={isDisplayOptionsOpen}
          onDismiss={() => setDisplayOptionsOpen(false)}
        >
          <Menu.Item
            title="Show expanded cards"
            titleStyle={{ fontWeight: manifestScreen.display === 'cards' ? 'normal' : 'bold'}}
            onPress={() => {
              dispatch(actions.screens.manifest.setDisplayStyle('list'));
              setDisplayOptionsOpen(false);
            }}
          />
          <Menu.Item
            title="Show compact cards"
            titleStyle={{ fontWeight: manifestScreen.display === 'list' ? 'normal' : 'bold'}}
            onPress={() => {
              dispatch(actions.screens.manifest.setDisplayStyle('cards'));
              setDisplayOptionsOpen(false);
            }}
          />
        </Menu>
      </View>
      <ManifestUserSheet
        open={forms.manifest.open}
        onClose={() => dispatch(actions.forms.manifest.setOpen(false))}
        onSuccess={() => dispatch(actions.forms.manifest.setOpen(false))}
      />
      <ManifestGroupSheet
        open={forms.manifestGroup.open}
        onClose={() => dispatch(actions.forms.manifestGroup.setOpen(false))}
        onSuccess={() => dispatch(actions.forms.manifestGroup.setOpen(false))}
      />

      <LoadDialog
        onSuccess={() => {
          dispatch(actions.forms.load.setOpen(false));
          refetch();
        }}
        open={forms.load.open}
        onClose={() => dispatch(actions.forms.load.setOpen(false))}
      />

    </>
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
    alignItems: "flex-start",
    justifyContent: "flex-end",
    flexDirection: 'row',
    padding: 0,
    width: "100%",
    position: "absolute",
    top: 0,
    backgroundColor: "transparent"
  }
});
