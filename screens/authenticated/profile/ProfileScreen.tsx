import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/core';
import { useQuery } from '@apollo/client';
import { successColor, warningColor } from "../../../constants/Colors";
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, DataTable, FAB, IconButton, List, ProgressBar } from 'react-native-paper';
import format from "date-fns/format";
import gql from 'graphql-tag';


import RigDialog from '../../../components/dialogs/RigDialog';
import { dropzoneUserForm, globalActions, rigForm, useAppDispatch, useAppSelector } from '../../../redux';
import { Query } from '../../../graphql/schema';
import ScrollableScreen from '../../../components/ScrollableScreen';
import DropzoneUserDialog from '../../../components/dialogs/DropzoneUserDialog';
import useRestriction from '../../../hooks/useRestriction';


const QUERY_DROPZONE_USER = gql`
  query QueryDropzoneUser($dropzoneId: Int!, $dropzoneUserId: Int!) {
    dropzone(id: $dropzoneId) {
      id
      name

      dropzoneUser(id: $dropzoneUserId) {
        id
        credits
        expiresAt
        role {
          id
          name
        }
        rigInspections {
          id
          isOk
          rig {
            id
          }
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
  const [dropzoneUserDialogOpen, setDropzoneUserDialogOpen] = React.useState(false);
  const route = useRoute<{ key: string, name: string, params: { userId: string }}>();
  const isSelf = state.currentDropzone?.currentUser?.id === route.params.userId;

  const { data, loading } = useQuery<Query>(QUERY_DROPZONE_USER, {
    variables: {
      dropzoneId: Number(state.currentDropzone?.id),
      dropzoneUserId: Number(route.params.userId)
    }
  });

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
              description={data?.dropzone?.dropzoneUser?.user?.name  || "-"}
            />
            <List.Item
              title="Email"
              left={() => <List.Icon icon="at" />}
              description={data?.dropzone?.dropzoneUser?.user?.email  || "-"}
            />

            <List.Item
              title="Phone"
              left={() => <List.Icon icon="phone" />}
              description={data?.dropzone?.dropzoneUser?.user?.phone  || "-"}
            />

            <List.Item
              title="License"
              left={() => <List.Icon icon="ticket-account" />}
              description={data?.dropzone?.dropzoneUser?.user?.license?.name || "-"}
            />

            <List.Item
              title="Exit weight"
              left={() => <List.Icon icon="scale" />}
              description={data?.dropzone?.dropzoneUser?.user?.exitWeight  || "-"}
            />
          </Card.Content>
          {
            isSelf && (
              <Card.Actions style={{ justifyContent: "flex-end"}}>
                <Button
                  icon="pencil"
                  onPress={() =>
                    navigation.navigate("UpdateUserScreen", { user: state.currentDropzone?.currentUser?.user })
                  }
                >
                  <Text>Edit</Text>
                </Button>
              </Card.Actions>
            )}
        </Card>
        <Card elevation={3} style={styles.card}>
          <Card.Title title={state.currentDropzone?.name} />
          <Card.Content>
            <List.Item
              title="Role"
              description={data?.dropzone?.dropzoneUser?.role?.name}
              left={() => <List.Icon icon="lock" />}
            />
            <List.Item
              title="Credits"
              description={data?.dropzone?.dropzoneUser?.credits}
              left={() => <List.Icon icon="cash-multiple" />}
            />
            <List.Item
              title="Membership"
              description={
                !data?.dropzone?.dropzoneUser?.expiresAt ?
                  <Text>Not a member</Text>
                : format((data?.dropzone?.dropzoneUser?.expiresAt || 0) * 1000, "yyyy/MM/dd")
              }
              left={() =>
                <List.Icon
                  icon="card-account-details"
                  color={
                    data?.dropzone?.dropzoneUser?.expiresAt && (
                      data?.dropzone?.dropzoneUser?.expiresAt * 1000 > new Date().getTime()
                    ) ? undefined : "#B00020"}
                />
              }

            />
          </Card.Content>
          <Card.Actions style={{ justifyContent: "flex-end"}}>
            <Button
              icon="pencil"
              onPress={() => {
                dispatch(dropzoneUserForm.setOriginal(data?.dropzone?.dropzoneUser!));
                setDropzoneUserDialogOpen(true);
              }}
            >
              <Text>Edit</Text>
            </Button>
          </Card.Actions>
        </Card>

        <Card elevation={3} style={styles.card}>
          <Card.Title title="Rigs" />
          <Card.Content>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>
                  Container
                </DataTable.Title>
                <DataTable.Title numeric>
                  Repack due
                </DataTable.Title>
                <DataTable.Title numeric>
                  Canopy size
                </DataTable.Title>
                <DataTable.Title numeric>
                  Inspected
                </DataTable.Title>
              </DataTable.Header>

              {
                data?.dropzone?.dropzoneUser?.user?.rigs?.map((rig) =>
                  <DataTable.Row
                    key={`rig-${rig!.id}`}
                    onPress={() => {
                      dispatch(rigForm.setOriginal(rig));
                      setRigDialogOpen(true);
                    }}
                    onLongPress={() =>
                      navigation.navigate("RigInspectionScreen", {
                        dropzoneUserId: Number(route.params.userId),
                        rig
                      })
                    }
                    pointerEvents="none"
                  >
                    <DataTable.Cell>
                      {[rig?.make, rig?.model, `#${rig?.serial}`].join(" ")}
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      {rig?.repackExpiresAt ? format(rig.repackExpiresAt * 1000, "yyyy/MM/dd") : "-"}
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      {`${rig?.canopySize}`}
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <IconButton
                        icon={
                          data?.dropzone?.dropzoneUser?.rigInspections?.some((insp) => insp.rig?.id === rig.id && insp.isOk)
                          ? "eye-check"
                          : "eye-minus"
                        }
                        color={
                          data?.dropzone?.dropzoneUser?.rigInspections?.some((insp) => insp.rig?.id === rig.id && insp.isOk)
                          ? successColor
                          : warningColor
                        }
                        onPress={() =>
                          navigation.navigate("RigInspectionScreen", {
                            dropzoneUserId: Number(route.params.userId),
                            rig
                          })
                        }
                      />
                    </DataTable.Cell>
                  </DataTable.Row>
                )
              }
            </DataTable>
          </Card.Content>
          {
            isSelf && (
            <Card.Actions style={{ justifyContent: "flex-end" }}>
              <Button onPress={() => setRigDialogOpen(true)} icon="plus">
                <Text>Add rig</Text>
              </Button>
            </Card.Actions>
          )}
        </Card>

        { data?.dropzone?.dropzoneUser?.id === state.currentUser?.id && (
          <Button color="#B00020" onPress={() => dispatch(globalActions.logout())}>
            <Text>Log out</Text>
          </Button>
        )}
      
      </ScrollableScreen>
      
      <RigDialog
        onClose={() => setRigDialogOpen(false)}
        onSuccess={() => setRigDialogOpen(false)}
        userId={Number(data?.dropzone?.dropzoneUser?.user?.id)}
        open={rigDialogOpen}
      />
      
      <DropzoneUserDialog
        onClose={() => setDropzoneUserDialogOpen(false)}
        onSuccess={() => setDropzoneUserDialogOpen(false)}
        open={dropzoneUserDialogOpen}
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
    margin: 8,
    width: "100%",
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
