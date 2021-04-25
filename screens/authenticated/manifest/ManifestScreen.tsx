import { useQuery } from '@apollo/client';
import { useIsFocused, useNavigation } from '@react-navigation/core';
import { startOfDay } from 'date-fns';
import gql from 'graphql-tag';
import * as React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { FAB, ProgressBar } from 'react-native-paper';
import ManifestUserDialog from '../../../components/dialogs/ManifestUserDialog';

import NoResults from '../../../components/NoResults';
import { View } from '../../../components/Themed';
import { Query } from '../../../graphql/schema';
import useRestriction from '../../../hooks/useRestriction';
import { globalActions, slotForm, useAppDispatch, useAppSelector } from '../../../redux';
import GetStarted from './GetStarted';
import LoadCard from './LoadCard';

const QUERY_DROPZONE = gql`
  query QueryDropzone($dropzoneId: Int!, $earliestTimestamp: Int) {
    dropzone(id: $dropzoneId) {
      id
      name
      primaryColor,
      secondaryColor,
      planes {
        id
        name
        registration
      }
      ticketTypes {
        id
        name
      }

      currentUser {
        id
        user {
          id
          name
          exitWeight
          email
          phone
          rigs {
            id
            model
            make
            serial
            canopySize
            repackExpiresAt
          }
          jumpTypes {
            id
            name
          }
          license {
            id
            name
          }
        }
      }

      loads(earliestTimestamp: $earliestTimestamp) {
        edges {
          node {
            id
            name
            isOpen
            maxSlots
            isFull
          }
        }
      }
    }
  }
`;



export default function ManifestScreen() {
  const state = useAppSelector(state => state.global);
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const dispatch = useAppDispatch();
  const { data, loading, refetch } = useQuery<Query>(QUERY_DROPZONE, {
    variables: {
      dropzoneId: Number(state.currentDropzone?.id),
      earliestTimestamp: startOfDay(new Date()).getTime() / 1000
    },
    fetchPolicy: "no-cache"
  });

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused]);

  const hasPlanes = !!data?.dropzone?.planes?.length;
  const hasTicketTypes = !!data?.dropzone?.ticketTypes?.length;
  const isPublic = !!data?.dropzone?.isPublic;
  const isSetupComplete = hasPlanes && hasTicketTypes;

  React.useEffect(() => {
    if (data?.dropzone?.id) {
      dispatch(globalActions.setDropzone(data.dropzone));
    
      dispatch(
        globalActions.setUser({
          ...state?.currentUser,
          ...(data?.dropzone?.currentUser.user || {})
        })
      );
    }
  }, [JSON.stringify(data?.dropzone)]);

  React.useEffect(() => {
    if (data?.dropzone?.primaryColor && data?.dropzone?.primaryColor !== state.theme?.colors?.primary) {
      dispatch(globalActions.setPrimaryColor(data.dropzone.primaryColor));
    }

    if (data?.dropzone?.secondaryColor && data?.dropzone?.secondaryColor !== state.theme?.colors?.accent) {
      dispatch(globalActions.setPrimaryColor(data.dropzone.secondaryColor));
    }
  }, [
    data?.dropzone?.primaryColor,
    data?.dropzone?.secondaryColor
  ])

  const allowed = useRestriction("createSlot");
  const canCreateLoad = useRestriction("createLoad");

  return (
    <>
    
    <ManifestUserDialog
      open={isDialogOpen}
      onClose={() => setDialogOpen(false)}
      onSuccess={() => setDialogOpen(false)}
    />
    <ProgressBar visible={loading} indeterminate color={state.theme.colors.accent} />
      <View style={styles.container}>
        
        {
          !loading && (
            !isSetupComplete
              ? <GetStarted {...{ hasPlanes, hasTicketTypes, isPublic }}/>
                : <View style={{ width: "100%", flex: 1,  height: Dimensions.get("window").height }}>
                  { (data?.dropzone?.loads?.edges?.length || 0) < 1
                    ? <NoResults
                        title="No loads so far today"
                        subtitle="How's the weather?"
                      />
                    : <FlatList
                        style={{ flex: 1, height: Dimensions.get("window").height }}
                        contentContainerStyle={{ flexGrow: 1 }}
                        numColumns={1}
                        data={data?.dropzone?.loads?.edges || []}
                        refreshing={loading}
                        onRefresh={refetch}
                        renderItem={({ item: edge, index }) =>
                          !edge?.node ? null : (
                            <LoadCard
                              key={`load-${edge.node.id}`}
                              load={edge.node}
                              canManifest={allowed && edge?.node?.isOpen && !edge?.node?.isFull}
                              loadNumber={(data?.dropzone?.loads?.edges?.length || 0) - index}
                              onSlotPress={(slot) => {
                                dispatch(slotForm.setOriginal(slot));
                                dispatch(
                                  slotForm.setField(["load", edge.node!])
                                );
                                setDialogOpen(true);
                              }}
                              onManifest={() => {
                                dispatch(
                                  slotForm.setField(["user", state.currentUser])
                                );
                                dispatch(
                                  slotForm.setField(["load", edge.node!])
                                );
                                setDialogOpen(true);
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
            onPress={() => navigation.navigate("CreateLoadScreen")}
            label="New load"
          />
        )}
      </View>
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
