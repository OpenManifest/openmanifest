import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/core';
import { useMutation } from '@apollo/client';
import * as React from 'react';
import { Platform, RefreshControl, StyleSheet, Text } from 'react-native';
import { Chip, DataTable, Divider, IconButton, ProgressBar } from 'react-native-paper';
import format from "date-fns/format";
import gql from 'graphql-tag';
import { ScrollView } from 'react-native-gesture-handler';
import { IconProps } from 'react-native-paper/lib/typescript/components/MaterialCommunityIcon';
import * as ImagePicker from 'expo-image-picker';


import { successColor, warningColor } from "../../../constants/Colors";
import { actions, useAppDispatch, useAppSelector } from '../../../redux';
import { Mutation, Permission, Query } from '../../../graphql/schema.d';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import DropzoneUserDialog from '../../../components/dialogs/DropzoneUserDialog';
import CreditsSheet from '../../../components/dialogs/CreditsDialog/Credits';
import RigDialog from '../../../components/dialogs/Rig';
import EditUserSheet from '../../../components/dialogs/User';

import TableCard from "./UserInfo/TableCard";
import Header from "./UserInfo/Header";
import InfoGrid from './UserInfo/InfoGrid';
import useCurrentDropzone from '../../../graphql/hooks/useCurrentDropzone';
import useDropzoneUser from '../../../graphql/hooks/useDropzoneUser';
import Badge from '../../../components/Badge';
import useRestriction from '../../../hooks/useRestriction';
import useMutationRevokePermission from '../../../graphql/hooks/useMutationRevokePermission';
import useMutationGrantPermission from '../../../graphql/hooks/useMutationGrantPermission';


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
  const forms = useAppSelector(state => state.forms);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { currentUser } = useCurrentDropzone();
  const route = useRoute<{ key: string, name: string, params: { userId: string }}>();
  const isSelf = currentUser?.id === route.params.userId;

  const { dropzoneUser, loading, refetch } = useDropzoneUser(Number(route.params.userId));
  const canGrantPermission = useRestriction(Permission.GrantPermission);

  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused])

  const [mutationUpdateUser, mutation] = useMutation<Mutation>(MUTATION_UPDATE_IMAGE);
  const revokePermission = useMutationRevokePermission({
    onSuccess: (payload) => {
      refetch();
      dispatch(actions.notifications.showSnackbar({ message: "Permission revoked" }))
    },
    onError: (error) => {
      dispatch(actions.notifications.showSnackbar({ message: error, variant: "error" }))
    },
  });
  const grantPermission = useMutationGrantPermission({
    onSuccess: (payload) => {
      refetch();
      dispatch(actions.notifications.showSnackbar({ message: "Permission granted" }));
    },
    onError: (error) => {
      dispatch(actions.notifications.showSnackbar({ message: error, variant: "error" }))
    },
  });

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
            id: Number(dropzoneUser?.user?.id),
            image: `data:image/jpeg;base64,${result.base64}`,
          }
        });
      } catch (e) {
        console.log(e);
      }
    },
    [dispatch],
  )

  const badges = dropzoneUser?.permissions?.filter((name) => /^actAs/.test(name)) || [];

  const canAddTransaction = useRestriction(Permission.CreateUserTransaction);
  const canUpdateUser = useRestriction(Permission.UpdateUser);
  const shouldShowBadge = (permission: Permission) => canGrantPermission || badges.includes(permission);

  return (
    <>
    {loading && <ProgressBar color={state.theme.colors.accent} indeterminate visible={loading} />}
    <ScrollableScreen contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refetch()} />}>
      <ScrollView horizontal style={{ width: "100%" }} contentContainerStyle={{ flexGrow: 1, padding: 8, justifyContent: "space-evenly", backgroundColor: state.theme.colors.primary }}>
        {
          [
            Permission.ActAsPilot,
            Permission.ActAsDzso,
            Permission.ActAsGca,
            Permission.ActAsRigInspector,
            Permission.ActAsLoadMaster,
          ].map((permission) =>
            !shouldShowBadge(permission)
              ? null
              : <Badge
                  type={permission as any}
                  selected={badges.includes(permission)}
                  onPress={() => !canGrantPermission ? null :
                    badges.includes(permission) 
                      ? revokePermission.mutate({ permissionName: permission, dropzoneUserId: Number(dropzoneUser.id) })
                      : grantPermission.mutate({ permissionName: permission, dropzoneUserId: Number(dropzoneUser.id) })
                  }
                />
          )
        }
      </ScrollView>
      <Header
        dropzoneUser={dropzoneUser!}
        canEdit={isSelf}
        onEdit={() => {
          if (dropzoneUser?.user) {
            dispatch(actions.forms.user.setOpen(dropzoneUser?.user));
          }
        }}
        onPressAvatar={onPickImage}
      >
       

        <ScrollView horizontal style={{ marginVertical: 8 }}>
          <Chip
            // @ts-ignore
            icon={({ size }: IconProps) =>
              <MaterialCommunityIcons name="email" size={size} color="#FFFFFF" />
            }
            mode="outlined"
            style={styles.chip}
            textStyle={styles.chipTitle}
          >
            {dropzoneUser?.user?.email  || "-"}
          </Chip>

          <Chip
            // @ts-ignore
            icon={({ size }: IconProps) =>
              <MaterialCommunityIcons name="phone" size={size} color="#FFFFFF" />
            }
            mode="outlined"
            style={styles.chip}
            textStyle={styles.chipTitle}
          >
            {dropzoneUser?.user?.phone  || "-"}
          </Chip>

          <Chip
            // @ts-ignore
            icon={({ size }: IconProps) =>
              <MaterialCommunityIcons name="card-account-details-star-outline" size={size} color="#FFFFFF" />
            }
            mode="outlined"
            style={styles.chip}
            textStyle={styles.chipTitle}
            onPress={() => {
              if (canUpdateUser) {
                dispatch(actions.forms.dropzoneUser.setOpen(dropzoneUser!));
              }
            }}
          >
            {!dropzoneUser?.expiresAt
                  ? "Not a member"
                  : format((dropzoneUser?.expiresAt || 0) * 1000, "yyyy/MM/dd")}
          </Chip>
        </ScrollView>
        <Divider style={styles.divider} />
        <InfoGrid
          items={[
            {
              title: "Funds",
              value: `$${dropzoneUser?.credits || 0}`,
              onPress: () => {
                if (dropzoneUser) {
                  dispatch(actions.forms.credits.setOpen(dropzoneUser));
                }
              }
            },
            { title: "License", value: `${dropzoneUser?.user?.license?.name || "-"}`},
            { title: "Exit weight", value: Math.round(Number(dropzoneUser?.user?.exitWeight)).toString() || "-" }
          ]}
        />
        <Divider style={[styles.divider, { backgroundColor: "white" }]} />
      </Header>
      
      <TableCard title="Rigs" buttonIcon="plus" onPressButton={() => dispatch(actions.forms.rig.setOpen(true))}>
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
            dropzoneUser?.user?.rigs?.map((rig) =>
              <DataTable.Row
                key={`rig-${rig!.id}`}
                onPress={() => {
                  dispatch(actions.forms.rig.setOpen(rig));
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
                      dropzoneUser?.rigInspections?.some((insp) => insp.rig?.id === rig.id && insp.isOk)
                      ? "eye-check"
                      : "eye-minus"
                    }
                    color={
                      dropzoneUser?.rigInspections?.some((insp) => insp.rig?.id === rig.id && insp.isOk)
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
        {
          ...canAddTransaction ? {
            buttonIcon: "plus",
            onPressButton: () => {
              if (dropzoneUser) {
                dispatch(actions.forms.credits.setOpen(dropzoneUser!));
              }
            }
          } : {}
        }
      >
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Time</DataTable.Title>
            <DataTable.Title>Type</DataTable.Title>
            <DataTable.Title>Message</DataTable.Title>
            <DataTable.Title numeric>Amount</DataTable.Title>
          </DataTable.Header>
          {
            dropzoneUser?.transactions?.edges?.map((edge) => (
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
      onClose={() => dispatch(actions.forms.rig.setOpen(false))}
      onSuccess={() => dispatch(actions.forms.rig.setOpen(false))}
      open={forms.rig.open}
      userId={Number(dropzoneUser?.user?.id)}
    />
    
    <DropzoneUserDialog
      onClose={() => dispatch(actions.forms.dropzoneUser.setOpen(false))}
      onSuccess={(user) => {
        dispatch(actions.forms.dropzoneUser.setOpen(false));
        if (currentUser?.id === dropzoneUser?.id) {
          dispatch(actions.global.setUser(user.user));
        }
      }}
      open={forms.dropzoneUser.open}
    />

    <CreditsSheet
      onClose={() => dispatch(actions.forms.credits.setOpen(false))}
      onSuccess={() => dispatch(actions.forms.credits.setOpen(false))}
      open={forms.credits.open}
      dropzoneUser={dropzoneUser || undefined}
    />

    <EditUserSheet
      onClose={() => dispatch(actions.forms.user.setOpen(false))} 
      onSuccess={() => dispatch(actions.forms.user.setOpen(false))}
      open={forms.user.open}
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
