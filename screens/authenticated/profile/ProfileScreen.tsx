import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/core';
import { useMutation, useQuery } from '@apollo/client';
import * as React from 'react';
import { Platform, RefreshControl, StyleSheet, Text } from 'react-native';
import { Chip, DataTable, Divider, IconButton, ProgressBar } from 'react-native-paper';
import format from "date-fns/format";
import gql from 'graphql-tag';
import { ScrollView } from 'react-native-gesture-handler';
import { IconProps } from 'react-native-paper/lib/typescript/components/MaterialCommunityIcon';
import * as ImagePicker from 'expo-image-picker';


import { successColor, warningColor } from "../../../constants/Colors";
import RigDialog from '../../../components/dialogs/RigDialog';
import { creditsForm, dropzoneUserForm, rigForm, useAppDispatch, useAppSelector } from '../../../redux';
import { Mutation, Query } from '../../../graphql/schema';
import ScrollableScreen from '../../../components/ScrollableScreen';
import DropzoneUserDialog from '../../../components/dialogs/DropzoneUserDialog';
import CreditsDialog from '../../../components/dialogs/CreditsDialog';

import TableCard from "./UserInfo/TableCard";
import Header from "./UserInfo/Header";
import InfoGrid from './UserInfo/InfoGrid';



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


        transactions {
          edges {
            node {
              id
              status
              message
              amount
              createdAt
            }
          }
        }
        user {
          id
          name
          exitWeight
          email
          phone
          image
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

const MUTATION_UPDATE_IMAGE = gql`
  mutation UpdateUserImage(
    $id: Int,
    $image: String
  ){
    updateUser(input: {
      id: $id
      attributes: {
        image: $image,
      }
    }) {
      user {
        id
        name
        exitWeight
        email
        image
        phone
        rigs {
          id
          model
          make
          serial
          canopySize
        }
        jumpTypes {
          id
          name
        }
        license {
          id
          name

          federation {
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
  const [creditsDialogOpen, setCreditsDialogOpen] = React.useState(false);
  const [rigDialogOpen, setRigDialogOpen] = React.useState(false);
  const [dropzoneUserDialogOpen, setDropzoneUserDialogOpen] = React.useState(false);
  const route = useRoute<{ key: string, name: string, params: { userId: string }}>();
  const isSelf = state.currentDropzone?.currentUser?.id === route.params.userId;

  const { data, loading, refetch } = useQuery<Query>(QUERY_DROPZONE_USER, {
    variables: {
      dropzoneId: Number(state.currentDropzone?.id),
      dropzoneUserId: Number(route.params.userId)
    }
  });

  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused])

  const [mutationUpdateUser, mutation] = useMutation<Mutation>(MUTATION_UPDATE_IMAGE);

  React.useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  
  const onPickImage = React.useCallback(
    async () => {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.1,
          base64: true,
        }) as { base64: string };
    

        // Upload image
        await mutationUpdateUser({
          variables: {
            id: Number(data?.dropzone?.dropzoneUser?.user?.id),
            image: `data:image/jpeg;base64,${result.base64}`,
          }
        });
      } catch (e) {
        console.log(e);
      }
    },
    [dispatch],
  )

  return (
    <>
    {loading && <ProgressBar color={state.theme.colors.accent} indeterminate visible={loading} />}
    <ScrollableScreen contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}>
      <Header
        dropzoneUser={data?.dropzone?.dropzoneUser!}
        canEdit={isSelf}
        onEdit={() =>
          navigation.navigate("UpdateUserScreen", { user: state.currentDropzone?.currentUser?.user })
        }
        onPressAvatar={onPickImage}
      >

        <ScrollView horizontal style={{ marginVertical: 8 }}>
          <Chip
            icon={({ size }: IconProps) =>
              <MaterialCommunityIcons name="email" size={size} color="#FFFFFF" />
            }
            mode="outlined"
            style={styles.chip}
            textStyle={styles.chipTitle}
          >
            {data?.dropzone?.dropzoneUser?.user?.email  || "-"}
          </Chip>

          <Chip
            icon={({ size }: IconProps) =>
              <MaterialCommunityIcons name="phone" size={size} color="#FFFFFF" />
            }
            mode="outlined"
            style={styles.chip}
            textStyle={styles.chipTitle}
          >
            {data?.dropzone?.dropzoneUser?.user?.phone  || "-"}
          </Chip>

          <Chip
            icon={({ size }: IconProps) =>
              <MaterialCommunityIcons name="card-account-details-star-outline" size={size} color="#FFFFFF" />
            }
            mode="outlined"
            style={styles.chip}
            textStyle={styles.chipTitle}
            onPress={() => {
              dispatch(dropzoneUserForm.setOriginal(data?.dropzone?.dropzoneUser!));
              setDropzoneUserDialogOpen(true);
            }}
          >
            {!data?.dropzone?.dropzoneUser?.expiresAt
                  ? "Not a member"
                  : format((data?.dropzone?.dropzoneUser?.expiresAt || 0) * 1000, "yyyy/MM/dd")}
          </Chip>
        </ScrollView>
        <Divider style={styles.divider} />
        <InfoGrid
          items={[
            { title: "Funds", value: `$${data?.dropzone?.dropzoneUser?.credits || 0}`},
            { title: "License", value: `${data?.dropzone?.dropzoneUser?.user?.license?.name || "-"}`},
            { title: "Exit weight", value: Math.round(Number(data?.dropzone?.dropzoneUser?.user?.exitWeight)).toString() || "-" }
          ]}
        />
        <Divider style={[styles.divider, { backgroundColor: "white" }]} />
      </Header>
      
      <TableCard title="Rigs" buttonIcon="plus" onPressButton={() => setRigDialogOpen(true)}>
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
      </TableCard>
        
      <TableCard
        title="Transactions"
        buttonIcon="plus"
        onPressButton={() => {
          if (data?.dropzone?.dropzoneUser) {
            dispatch(creditsForm.setOriginal(data!.dropzone!.dropzoneUser!));
            setCreditsDialogOpen(true);
          }
        }}
      >
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Time</DataTable.Title>
            <DataTable.Title>Type</DataTable.Title>
            <DataTable.Title>Message</DataTable.Title>
            <DataTable.Title numeric>Amount</DataTable.Title>
          </DataTable.Header>
          {
            data?.dropzone?.dropzoneUser?.transactions?.edges?.map((edge) => (
              <DataTable.Row key={`transaction-${edge?.node?.id}`}>
                <DataTable.Cell>
                  <Text style={{ fontSize: 12, fontStyle: "italic", color: "#999999" }}>{!edge?.node?.createdAt ? null : format(edge?.node?.createdAt * 1000, "yyyy/MM/dd hh:mm")}</Text>
                </DataTable.Cell>
                <DataTable.Cell>
                  <Text style={{ fontSize: 12, fontStyle: "italic", color: "#999999" }}>{edge?.node?.status}</Text>
                </DataTable.Cell>
                <DataTable.Cell>
                  {edge?.node?.message}
                </DataTable.Cell>
                <DataTable.Cell numeric>
                  {edge?.node?.amount}
                </DataTable.Cell>
              </DataTable.Row>
            ))
          }
        </DataTable>

      </TableCard>
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

    <CreditsDialog
      onClose={() => setCreditsDialogOpen(false)}
      onSuccess={() => setCreditsDialogOpen(false)}
      open={creditsDialogOpen}
    />
  </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 56,
    paddingHorizontal: 0,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  chip: {
    margin: 1,
    backgroundColor: "transparent",
    minHeight: 23,
    borderWidth: 0,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
  chipTitle: {
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 12,
    lineHeight: 24,
    textAlignVertical: "center"
  }
});
