import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { Card, Title, FAB, Paragraph, List } from 'react-native-paper';
import { View } from '../../../components/Themed';
import { Query } from "../../../graphql/schema";

import { useNavigation, useRoute } from '@react-navigation/core';
import { useAppSelector } from '../../../redux';
import NoResults from '../../../components/NoResults';


const QUERY_PLANES = gql`
  query QueryPlanes(
    $dropzoneId: Int!
  ) {
    planes(dropzoneId: $dropzoneId) {
      id
      name
      registration
      hours
      minSlots
      maxSlots
      nextMaintenanceHours
      createdAt
    }
  }
`;

export default function PlanesScreen() {
  const state = useAppSelector(state => state.global);
  const { data, loading, refetch } = useQuery<Query>(QUERY_PLANES, {
    variables: {
      dropzoneId: Number(state.currentDropzone?.id)
    }
  });
  const navigation = useNavigation();
  const route = useRoute();

  // React.useEffect(() => {
  //   if (route.name === "PlanesScreen") {
  //     refetch();
  //   }
  // }, [route.name])
 

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.planes || []}
        numColumns={1}
        refreshing={loading}
        onRefresh={() => refetch()}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={() =>
          <NoResults
            title="No planes?"
            subtitle="You need to have at least one plane to manifest loads"
          />
        }
        renderItem={({ item }) =>
          <List.Item
            title={item.name}
            onPress={() => navigation.navigate("UpdatePlaneScreen", { plane: item })}
            left={() => <List.Icon color="#000" icon="airplane" />}
            right={() => <List.Icon color="#000" icon="pencil" />}
          />
        }
      />
      
      <FAB
        style={styles.fab}
        small
        icon="plus"
        onPress={() => navigation.navigate("CreatePlaneScreen")}
        label="New plane"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    display: "flex"
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%"
  }
});
