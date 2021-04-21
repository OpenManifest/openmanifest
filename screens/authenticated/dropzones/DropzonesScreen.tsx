import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { StyleSheet, FlatList, Dimensions } from 'react-native';
import { Card, Title, FAB, Paragraph } from 'react-native-paper';
import { View } from '../../../components/Themed';
import { globalActions, useAppDispatch, useAppSelector } from '../../../redux';
import { Query } from "../../../graphql/schema";

import { useNavigation } from '@react-navigation/core';


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
  const { data, loading, refetch } = useQuery<Query>(QUERY_DROPZONES);
  const navigation = useNavigation();
 

  return (
    <View style={styles.container}>
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
        renderItem={({ item }) =>
          <Card
            style={{
              width: (Dimensions.get("window").width / 2) - 32,
              margin: 8
            }}
            onPress={async ()=> {
              if (item?.node) {
                dispatch(
                  globalActions.setDropzone(item.node)
                );
              }
            }}
          >
            <Card.Cover source={{ uri: item?.node?.banner as string }} />
            <Card.Content>
              <Title>{item?.node?.name}</Title>
            </Card.Content>
          </Card>
        }
      />
      
      <FAB
        style={styles.fab}
        small
        icon="plus"
        onPress={() => navigation.navigate("CreateDropzoneScreen")}
        label="Create dropzone"
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
