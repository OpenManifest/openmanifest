import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/core';
import { useMutation } from '@apollo/client';
import * as React from 'react';
import { Platform, RefreshControl, StyleSheet, View } from 'react-native';
import { Card, Chip, Divider, List, ProgressBar } from 'react-native-paper';
import format from 'date-fns/format';
import gql from 'graphql-tag';
import { ScrollView } from 'react-native-gesture-handler';
import { IconProps } from 'react-native-paper/lib/typescript/components/MaterialCommunityIcon';
import * as ImagePicker from 'expo-image-picker';

import { actions, useAppDispatch, useAppSelector } from '../../../state';
import { Mutation, Permission } from '../../../api/schema.d';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import DropzoneUserDialog from '../../../components/dialogs/DropzoneUserDialog';
import CreditsSheet from '../../../components/dialogs/CreditsDialog/Credits';
import RigDialog from '../../../components/dialogs/Rig';
import EditUserSheet from '../../../components/dialogs/User';

import Header from './UserInfo/Header';
import InfoGrid from './UserInfo/InfoGrid';
import useCurrentDropzone from '../../../api/hooks/useCurrentDropzone';
// eslint-disable-next-line max-len
import useDropzoneUserProfile from '../../../api/hooks/useDropzoneUserProfile';
import useRestriction from '../../../hooks/useRestriction';

import SlotCard from './SlotCard';
import PermissionBadges from './UserInfo/PermissionBadges';

const MUTATION_UPDATE_IMAGE = gql`
  mutation UpdateUserImage($id: Int, $image: String) {
    updateUser(input: { id: $id, attributes: { image: $image } }) {
      user {
        id
        name
        exitWeight
        email
        image
        phone
        rigs {
          id
          name
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
  const state = useAppSelector((root) => root.global);
  const forms = useAppSelector((root) => root.forms);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { currentUser } = useCurrentDropzone();
  const route = useRoute<{ key: string; name: string; params: { userId: string } }>();
  const isSelf = currentUser?.id === route.params.userId;

  const { dropzoneUser, loading, refetch } = useDropzoneUserProfile(
    Number(route.params.userId) || Number(currentUser?.id)
  );

  const isFocused = useIsFocused();

  React.useEffect(() => navigation.setOptions({ title: 'Profile' }), [navigation]);
  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  const [mutationUpdateUser] = useMutation<Mutation>(MUTATION_UPDATE_IMAGE);

  React.useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          console.error('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const onPickImage = React.useCallback(async () => {
    try {
      const result = (await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.1,
        base64: true,
      })) as { base64: string };

      // Upload image
      await mutationUpdateUser({
        variables: {
          id: Number(dropzoneUser?.user?.id),
          image: `data:image/jpeg;base64,${result.base64}`,
        },
      });
    } catch (e) {
      console.log(e);
    }
  }, [dropzoneUser?.user?.id, mutationUpdateUser]);

  const badges = dropzoneUser?.permissions?.filter((name) => /^actAs/.test(name)) || [];

  const canAddTransaction = useRestriction(Permission.CreateUserTransaction);
  const canUpdateUser = useRestriction(Permission.UpdateUser);
  const canViewOthersTransactions = useRestriction(Permission.ReadUserTransactions);

  return (
    <>
      {loading && <ProgressBar color={state.theme.colors.accent} indeterminate visible={loading} />}
      <ScrollableScreen
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refetch()} />}
      >
        {!dropzoneUser ? null : (
          <Header
            dropzoneUser={dropzoneUser}
            canEdit={isSelf}
            onEdit={() => {
              if (dropzoneUser?.user) {
                dispatch(actions.forms.user.setOpen(dropzoneUser?.user));
              }
            }}
            onPressAvatar={onPickImage}
          >
            <ScrollView
              horizontal
              style={{ marginVertical: 8 }}
              showsHorizontalScrollIndicator={false}
            >
              <Chip
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore This is a valid prop
                icon={({ size }: IconProps) => (
                  <MaterialCommunityIcons name="email" size={size} color="#FFFFFF" />
                )}
                mode="outlined"
                style={styles.chip}
                textStyle={styles.chipTitle}
              >
                {dropzoneUser?.user?.email || '-'}
              </Chip>

              <Chip
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore This is a valid prop
                icon={({ size }: IconProps) => (
                  <MaterialCommunityIcons name="phone" size={size} color="#FFFFFF" />
                )}
                mode="outlined"
                style={styles.chip}
                textStyle={styles.chipTitle}
              >
                {dropzoneUser?.user?.phone || '-'}
              </Chip>

              <Chip
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore This is a valid prop
                icon={({ size }: IconProps) => (
                  <MaterialCommunityIcons
                    name="card-account-details-star-outline"
                    size={size}
                    color="#FFFFFF"
                  />
                )}
                mode="outlined"
                style={styles.chip}
                textStyle={styles.chipTitle}
                onPress={() => {
                  if (canUpdateUser) {
                    dispatch(actions.forms.dropzoneUser.setOpen(dropzoneUser));
                  }
                }}
              >
                {!dropzoneUser?.expiresAt
                  ? 'Not a member'
                  : format((dropzoneUser?.expiresAt || 0) * 1000, 'yyyy/MM/dd')}
              </Chip>
            </ScrollView>

            <Divider style={styles.divider} />
            <InfoGrid
              items={[
                {
                  title: 'Funds',
                  value: `$${dropzoneUser?.credits || 0}`,
                  onPress: () => {
                    if (dropzoneUser && canAddTransaction) {
                      dispatch(actions.forms.credits.setOpen(dropzoneUser));
                    }
                  },
                },
                {
                  title: 'License',
                  value: `${dropzoneUser?.user?.license?.name || '-'}`,
                },
                {
                  title: 'Exit weight',
                  value: Math.round(Number(dropzoneUser?.user?.exitWeight)).toString() || '-',
                },
              ]}
            />
            <Divider
              style={[
                styles.divider,
                { height: StyleSheet.hairlineWidth, backgroundColor: 'white' },
              ]}
            />
            <PermissionBadges {...{ dropzoneUser, permissions: badges }} />
          </Header>
        )}
        <View style={{ width: '100%' }}>
          <List.Subheader>Manage</List.Subheader>
          <Card style={{ margin: 8, marginRight: 8 }} elevation={1}>
            {isSelf || canViewOthersTransactions ? (
              <>
                <List.Item
                  style={{ width: '100%', padding: 0 }}
                  title="Transactions"
                  left={() => <List.Icon icon="cash" />}
                  right={() => <List.Icon icon="chevron-right" />}
                  onPress={() =>
                    navigation.navigate('TransactionsScreen', { userId: dropzoneUser?.id })
                  }
                />
                <Divider style={{ width: '100%' }} />
              </>
            ) : null}
            <List.Item
              style={{ width: '100%', padding: 0 }}
              title="Equipment"
              left={() => <List.Icon icon="parachute" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => navigation.navigate('EquipmentScreen', { userId: dropzoneUser?.id })}
            />
          </Card>
        </View>

        <View style={{ width: '100%' }}>
          <List.Subheader>History</List.Subheader>
          <Card style={{ margin: 8, marginHorizontal: 0 }} elevation={1}>
            {dropzoneUser?.slots?.edges?.map((edge) =>
              edge?.node ? (
                <SlotCard
                  slot={edge.node}
                  onPress={() => {
                    navigation.navigate('LoadScreen', { load: edge.node });
                  }}
                />
              ) : null
            )}
          </Card>
        </View>
      </ScrollableScreen>

      <RigDialog
        onClose={() => dispatch(actions.forms.rig.setOpen(false))}
        onSuccess={() => requestAnimationFrame(() => dispatch(actions.forms.rig.setOpen(false)))}
        open={forms.rig.open}
        userId={Number(dropzoneUser?.user?.id)}
      />

      <DropzoneUserDialog
        onClose={() => dispatch(actions.forms.dropzoneUser.setOpen(false))}
        onSuccess={(user) => {
          dispatch(actions.forms.dropzoneUser.setOpen(false));
          if (currentUser?.id === dropzoneUser?.id) {
            dispatch(actions.global.setUser(user.user));
            refetch();
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
        dropzoneUserId={Number(dropzoneUser?.id)}
        onClose={() => dispatch(actions.forms.user.setOpen(false))}
        onSuccess={() => {
          dispatch(actions.forms.user.setOpen(false));
        }}
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
    backgroundColor: 'transparent',
    minHeight: 23,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
  chipTitle: {
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 12,
    lineHeight: 24,
    textAlignVertical: 'center',
  },
});
