import { useIsFocused, useNavigation } from '@react-navigation/core';
import * as React from 'react';
import { Dimensions, RefreshControl, StyleSheet, useWindowDimensions } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { FAB, ProgressBar } from 'react-native-paper';
import ManifestUserSheet from '../../../components/dialogs/ManifestUser/ManifestUser';
import ManifestGroupSheet from '../../../components/dialogs/ManifestGroup/ManifestGroup';

import NoResults from '../../../components/NoResults';
import { View } from '../../../components/Themed';
import { Load } from '../../../graphql/schema';
import useRestriction from '../../../hooks/useRestriction';
import { actions, useAppDispatch, useAppSelector } from '../../../redux';
import GetStarted from './GetStarted';
import LoadCard from './LoadCard';
import LoadDialog from '../../../components/dialogs/Load';
import useCurrentDropzone from '../../../graphql/hooks/useCurrentDropzone';


export default function ManifestScreen() {
  const state = useAppSelector(state => state.global);
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const [isLoadDialogOpen, setLoadDialogOpen] = React.useState(false);
  const [isGroupDialogOpen, setGroupDialogOpen] = React.useState(false);
  const dispatch = useAppDispatch();
  const { dropzone, currentUser, loading, refetch } = useCurrentDropzone();

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      console.log("IS FOCUSED!");
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

  const canCreateLoad = useRestriction("createLoad");

  const onManifest = React.useCallback((load: Load) => {
    
    if (!currentUser.hasLicense) {
      return dispatch(
        actions.notifications.showSnackbar({
          message: "You need to select a license on your user profile",
          variant: "warning"
        })
      );
    }

    if (!currentUser.hasMembership) {
      return dispatch(
        actions.notifications.showSnackbar({
          message: "Your membership is out of date",
          variant: "warning"
        })
      );
    }

    if (!currentUser.hasRigInspection) {
      return dispatch(
        actions.notifications.showSnackbar({
          message: "Your rig needs to be inspected before manifesting",
          variant: "warning"
        })
      );
    }

    if (!currentUser.hasReserveInDate) {
      return dispatch(
        actions.notifications.showSnackbar({
          message: "Your rig needs a reserve repack",
          variant: "warning"
        })
      );
    }

    if (!currentUser.hasExitWeight) {
      return dispatch(
        actions.notifications.showSnackbar({
          message: "Update your exit weight on your profile before manifesting",
          variant: "warning"
        })
      );
    }

    if (!currentUser.hasCredits) {
      return dispatch(
        actions.notifications.showSnackbar({
          message: "You have no credits on your account",
          variant: "warning"
        })
      );
    }


    dispatch(
      actions.forms.manifest.setField(["user", currentUser.user])
    );
    dispatch(
      actions.forms.manifest.setField(["load", load])
    );
    setDialogOpen(true);
  }, [JSON.stringify(dropzone?.currentUser)]);


  const { width } = useWindowDimensions(); 

  const numColumns = Math.ceil(width / 400) || 1;
  

  console.log("SHOWING LOADS: ", dropzone?.loads?.edges?.length);
  console.log("SHOWING LOADS: ", loading, Number(state.currentDropzone?.id));
  return (
    <>
    <ProgressBar visible={loading} indeterminate color={state.theme.colors.accent} />
      <View style={styles.container}>
        
        {
          !loading && (
            !isSetupComplete
              ? <GetStarted {...{ hasPlanes, hasTicketTypes, isPublic }}/>
                : <View style={{ width: "100%", flex: 1,  height: Dimensions.get("window").height }}>
                  { (dropzone?.loads?.edges?.length || 0) < 1
                    ? <NoResults
                        title="No loads so far today"
                        subtitle="How's the weather?"
                      />
                    : <FlatList
                        testID="loads"
                        keyExtractor={(item) => `load-${item?.node?.id}`}
                        key={`loads-columns-${numColumns}`}
                        style={{ flex: 1, height: Dimensions.get("window").height }}
                        contentContainerStyle={{ flexGrow: 1 }}
                        numColumns={numColumns}
                        data={dropzone?.loads?.edges || []}
                        refreshing={loading}
                        onRefresh={refetch}
                        refreshControl={
                          <RefreshControl refreshing={loading} onRefresh={() => refetch()} />
                        }
                        renderItem={({ item: edge, index }) =>
                          !edge?.node ? null : (
                            <LoadCard
                              key={`load-${edge.node.id}`}
                              load={edge.node}
                              onSlotPress={(slot) => {
                                dispatch(actions.forms.manifest.setOriginal(slot));
                                dispatch(
                                  actions.forms.manifest.setField(["load", edge.node!])
                                );
                                setDialogOpen(true);
                              }}
                              onSlotGroupPress={(slots) => {
                                dispatch(actions.forms.manifestGroup.reset());
                                dispatch(actions.forms.manifestGroup.setFromSlots(slots));
                                dispatch(actions.forms.manifestGroup.setField(["load", edge.node!]));
                                navigation.navigate("ManifestGroupScreen");
                              }}
                              onManifest={() => onManifest(edge.node!)}
                              onManifestGroup={() => {
                                dispatch(actions.forms.manifestGroup.reset());
                                dispatch(actions.forms.manifestGroup.setField(["load", 
                                edge.node!]));
                                setGroupDialogOpen(true);
                              }}
                            />
                        )}
                    />
                  }

                </View>
        )}
        { canCreateLoad && isSetupComplete && (
          <FAB
            style={styles.fab}
            small
            icon="plus"
            onPress={() => setLoadDialogOpen(true)}
            label="New load"
          />
        )}
      </View>
      <ManifestUserSheet
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => setDialogOpen(false)}
      />
      <ManifestGroupSheet
        open={isGroupDialogOpen}
        onClose={() => setGroupDialogOpen(false)}
        onSuccess={() => setGroupDialogOpen(false)}
      />

      <LoadDialog
        onSuccess={() => {
          setLoadDialogOpen(false);
          refetch();
        }}
        open={isLoadDialogOpen}
        onClose={() => setLoadDialogOpen(false)}
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
});