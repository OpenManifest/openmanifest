import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { StyleSheet, FlatList, Dimensions } from 'react-native';
import { Card, Title, FAB, Paragraph } from 'react-native-paper';
import { View } from '../../../components/Themed';
import { actions, useAppDispatch, useAppSelector } from '../../../redux';
import { Query } from "../../../graphql/schema.d";

import { useNavigation } from '@react-navigation/core';
import { SafeAreaView } from 'react-native-safe-area-context';


const QUERY_DROPZONES = gql`
  query QueryDropzones {
    dropzones {
      edges {
        node {
          id
          name
          banner
          ticketTypes {
            id
            name
            cost
            allowManifestingSelf
            currency
          }
          planes {
            id
            name,
            registration,
            minSlots,
            maxSlots,
          }
        }
      }
    }
  }
`;

export default function DropzonesScreen() {
  const dispatch = useAppDispatch();
  const globalState = useAppSelector(state => state.global);
  const { data, loading, refetch } = useQuery<Query>(QUERY_DROPZONES);
  const navigation = useNavigation();
 

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data?.dropzones?.edges || []}
        numColumns={2}
        
        refreshing={loading}
        onRefresh={() => refetch()}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={() =>
          <View style={styles.empty}>
            <Title>No dropzones?</Title>
            <Paragraph>
              You can set one up!
            </Paragraph>
          </View>
        }
        renderItem={({ item }) => {
          return (
            <Card
              style={{
                width: (Dimensions.get("window").width / 2) - 32,
                margin: 8
              }}
              onPress={async ()=> {
                if (item?.node) {
                  const shouldPushRoute = !!globalState.currentDropzoneId; 
                  dispatch(
                    actions.global.setDropzone(item.node)
                  );

                  if (shouldPushRoute) {
                    navigation.replace("Authenticated", { screen: "HomeScreen"});
                  }
                }
              }}
            >
              <Card.Cover source={{ uri: item?.node?.banner as string }} />
              <Card.Content>
                <Title>{item?.node?.name}</Title>
              </Card.Content>
            </Card>
          )
        }}
      />
      
      <FAB
        style={styles.fab}
        small
        icon="plus"
        onPress={() => {
          dispatch(actions.forms.plane.reset());
          dispatch(actions.forms.ticketType.reset());
          dispatch(actions.forms.dropzone.reset());
          dispatch(actions.forms.dropzoneWizard.setOpen(true));
        }}
        label="Create dropzone"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    display: "flex",
    backgroundColor: "#FF1414",
  },
  fab: {
    position: 'absolute',
    margin: 32,
    right: 16,
    bottom: 0,
    backgroundColor: "#FFFFFF"
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%"
  }
});
