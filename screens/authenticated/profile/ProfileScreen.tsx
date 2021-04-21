import { useNavigation } from '@react-navigation/core';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Card, DataTable, FAB, List, ProgressBar } from 'react-native-paper';
import format from "date-fns/format";
import { View } from '../../../components/Themed';
import RigDialog from '../../../components/dialogs/RigDialog';
import { globalActions, rigForm, useAppDispatch, useAppSelector } from '../../../redux';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client';
import { Query } from '../../../graphql/schema';
import { ScrollView } from 'react-native';
import ScrollableScreen from '../../../components/ScrollableScreen';


const QUERY_DROPZONE_USER = gql`
  query QueryDropzoneUser($dropzoneId: Int!) {
    dropzone(id: $dropzoneId) {
      id
      name
      currentUser {
        id
        credits
        role {
          id
          name
        }
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
    }
  }
`;
export default function ProfileScreen() {
  const state = useAppSelector(state => state.global);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const [rigDialogOpen, setRigDialogOpen] = React.useState(false);
  const { data, loading } = useQuery<Query>(QUERY_DROPZONE_USER, {
    variables: {
      dropzoneId: Number(state.currentDropzone?.id),
    }
  });

  const getRigPressAction = React.useCallback((rig) => {
    return () => {
      dispatch(rigForm.setOriginal(rig));
      setRigDialogOpen(true);
    }
  }, [dispatch, setRigDialogOpen]);

  return (
    <>
    <ProgressBar color={state.theme.colors.accent} indeterminate visible={loading} />
    <ScrollableScreen contentContainerStyle={styles.content}>
      
        <Card elevation={3} style={styles.card}>
          <Card.Title title="Basic information" />
          <Card.Content>
            <List.Item
              title="Name"
              left={() => <List.Icon icon="account-outline" />}
              description={data?.dropzone?.currentUser?.user?.name  || "-"}
            />
            <List.Item
              title="Email"
              left={() => <List.Icon icon="at" />}
              description={data?.dropzone?.currentUser?.user?.email  || "-"}
            />

            <List.Item
              title="Phone"
              left={() => <List.Icon icon="phone" />}
              description={data?.dropzone?.currentUser?.user?.phone  || "-"}
            />

            <List.Item
              title="License"
              left={() => <List.Icon icon="ticket-account" />}
              description={data?.dropzone?.currentUser?.user?.license?.name || "-"}
            />

            <List.Item
              title="Exit weight"
              left={() => <List.Icon icon="scale" />}
              description={data?.dropzone?.currentUser?.user?.exitWeight  || "-"}
            />
          </Card.Content>
          <Card.Actions style={{ justifyContent: "flex-end"}}>
            <Button icon="pencil" onPress={() => navigation.navigate("UpdateUserScreen", { user: state.currentUser })}>
              Edit
            </Button>
          </Card.Actions>
        </Card>
        <Card elevation={3} style={styles.card}>
          <Card.Title title={state.currentDropzone?.name} />
          <Card.Content>
            <List.Item
              title="Role"
              description={data?.dropzone?.currentUser?.role?.name}
              left={() => <List.Icon icon="lock" />}
            />
            <List.Item
              title="Credits"
              description={data?.dropzone?.currentUser?.credits}
              left={() => <List.Icon icon="cash-multiple" />}
            />
          </Card.Content>
          <Card.Actions style={{ justifyContent: "flex-end"}}>
            <Button icon="pencil">
              Edit
            </Button>
          </Card.Actions>
        </Card>

        <Card elevation={3} style={styles.card}>
          <Card.Title title="Rigs" />
          <Card.Content>
            <DataTable>
              <DataTable.Header>
                <DataTable.Row>
                  <DataTable.Title>
                    Make
                  </DataTable.Title>
                  <DataTable.Title>
                    Model
                  </DataTable.Title>
                  <DataTable.Title>
                    Serial
                  </DataTable.Title>
                  <DataTable.Title numeric>
                    Repack expires
                  </DataTable.Title>
                  <DataTable.Title numeric>
                    Canopy size
                  </DataTable.Title>
                </DataTable.Row>
              </DataTable.Header>

              {
                data?.dropzone?.currentUser?.user?.rigs?.map((rig) =>
                  <DataTable.Row onPress={getRigPressAction(rig)}>
                    <DataTable.Cell onPress={getRigPressAction(rig)}>
                      {rig?.make}
                    </DataTable.Cell>
                    <DataTable.Cell onPress={getRigPressAction(rig)}>
                      {rig?.model}
                    </DataTable.Cell>
                    <DataTable.Cell onPress={getRigPressAction(rig)}>
                      {rig?.serial}
                    </DataTable.Cell>
                    <DataTable.Cell onPress={getRigPressAction(rig)}>
                      {rig?.repackExpiresAt ? format(rig.repackExpiresAt * 1000, "yyyy/MM/dd") : "-"}
                    </DataTable.Cell>
                    <DataTable.Cell onPress={getRigPressAction(rig)}>
                      {`${rig?.canopySize}sqft`}
                    </DataTable.Cell>
                  </DataTable.Row>
                )
              }
            </DataTable>
          </Card.Content>
          <Card.Actions style={{ justifyContent: "flex-end" }}>
            <Button onPress={() => setRigDialogOpen(true)}>
              Add rig
            </Button>
          </Card.Actions>
        </Card>

        <Button color="#B00020" onPress={() => dispatch(globalActions.logout())}>
          Log out
        </Button>
      
      </ScrollableScreen>
      
      <RigDialog
        onClose={() => setRigDialogOpen(false)}
        onSuccess={() => setRigDialogOpen(true)}
        userId={Number(data?.dropzone?.currentUser?.user?.id)}
        open={rigDialogOpen}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flexGrow: 1,
    paddingBottom: 56
  },
  card: {
    marginVertical: 8,
    width: "80%"
  },
  fields: {
    width: "80%",
    display: "flex",
  },
  spacer: {
    width: "100%",
    height: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
