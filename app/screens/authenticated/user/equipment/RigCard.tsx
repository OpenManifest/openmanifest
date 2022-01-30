import { format } from 'date-fns';
import * as React from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { Avatar, Card, Chip, Divider, Menu, ProgressBar, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/core';
import {
  RigInspectionEssentialsFragment,
  RigEssentialsFragment,
  DropzoneUserEssentialsFragment,
} from 'app/api/operations';
import useCurrentDropzone from 'app/api/hooks/useCurrentDropzone';
import useRestriction from 'app/hooks/useRestriction';

import useMutationUpdateRig from 'app/api/hooks/useMutationUpdateRig';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { errorColor, successColor } from 'app/constants/Colors';

import { Permission } from 'app/api/schema.d';
import { useUserNavigation } from '../routes';

export interface IRigCardProps {
  rig: RigEssentialsFragment;
  dropzoneUser?: DropzoneUserEssentialsFragment | null;
  rigInspection?: RigInspectionEssentialsFragment;
  onSuccessfulImageUpload?(): void;
  onPress?(): void;
}
export default function RigCard(props: IRigCardProps) {
  const { rig, rigInspection, dropzoneUser, onSuccessfulImageUpload, onPress } = props;
  const [isUploading, setUploading] = React.useState(false);
  const { accent } = useAppSelector((root) => root.global.theme.colors);
  const dispatch = useAppDispatch();
  const { currentUser } = useCurrentDropzone();

  const updateRig = useMutationUpdateRig({
    onSuccess: () => {
      setUploading(false);
      onSuccessfulImageUpload?.();
      dispatch(
        actions.notifications.showSnackbar({ message: 'Image uploaded', variant: 'success' })
      );
    },
    onError: (err) => {
      console.log(err);
      setUploading(false);
      dispatch(actions.notifications.showSnackbar({ message: 'Upload failed', variant: 'error' }));
    },
  });
  const [isPackingCardMenuOpen, setPackingCardMenuOpen] = React.useState<boolean>(false);
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

      setUploading(true);
      // Upload image
      await updateRig.mutate({
        id: Number(rig?.id),
        packingCard: `data:image/jpeg;base64,${result.base64}`,
      });
    } catch (e) {
      console.log(e);
    }
  }, [rig?.id, updateRig]);

  const canManageDropzoneRigs = useRestriction(Permission.UpdateDropzoneRig);
  const navigation = useUserNavigation();
  const canUpdateRig =
    currentUser?.user?.id === rig.user?.id || (rig?.dropzone?.id && canManageDropzoneRigs);

  const theme = useTheme();
  
  return (
    <Card onPress={onPress} style={{ marginVertical: 16 }}>
      <ProgressBar visible={isUploading} indeterminate color={accent} />
      <Card.Title title={rig.name || `${rig.make} ${rig.model}`} />
      <Card.Content>
        <View style={styles.content}>
          <View style={styles.left}>
            <Avatar.Icon
              icon="parachute"
              size={70}
              style={{ backgroundColor: theme.dark ? theme.colors.surface : theme.colors.primary }}
            />
          </View>
          <View style={styles.right}>
            <View style={styles.textRow}>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>Container</Text>
              <Text style={[styles.description, { color: theme.colors.onSurface }]}>
                {rig.make} {rig.model}
              </Text>
            </View>
            <View style={styles.textRow}>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                Main canopy size
              </Text>
              <Text style={[styles.description, { color: theme.colors.onSurface }]}>
                {rig.canopySize}
              </Text>
            </View>
            <View style={styles.textRow}>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                Repack expiry date
              </Text>
              <Text style={[styles.description, { color: theme.colors.onSurface }]}>
                {rig.repackExpiresAt ? format(rig.repackExpiresAt * 1000, 'yyyy/MM/dd') : 'N/A'}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 8 }} />
      </Card.Content>
      <Card.Actions style={{ justifyContent: 'flex-end' }} pointerEvents="box-none">
        <Menu
          onDismiss={() => setPackingCardMenuOpen(false)}
          visible={isPackingCardMenuOpen}
          style={{ marginTop: 12 }}
          anchor={
            <Chip
              mode="outlined"
              icon="camera"
              style={{ height: 24, alignItems: 'center' }}
              onPress={() => {
                if (canUpdateRig) {
                  setPackingCardMenuOpen(true);
                } else if (rig?.packingCard) {
                  dispatch(actions.imageViewer.setOpen(rig.packingCard));
                }
              }}
            >
              {!rig.packingCard ? 'No packing card' : 'Packing card'}
            </Chip>
          }
        >
          <Menu.Item
            title="Upload new"
            icon="camera"
            style={{ paddingVertical: 0 }}
            onPress={() => {
              onPickImage();
              setPackingCardMenuOpen(false);
            }}
          />

          {!rig.packingCard ? null : (
            <>
              <Divider />
              <Menu.Item
                title="View"
                icon="eye"
                style={{ paddingVertical: 0 }}
                onPress={() => {
                  setPackingCardMenuOpen(false);
                  if (rig.packingCard) {
                    dispatch(actions.imageViewer.setOpen(rig.packingCard));
                  }
                }}
              />
            </>
          )}
        </Menu>

        <Chip
          mode="outlined"
          style={[
            styles.chip,
            {
              backgroundColor: rigInspection?.inspectedBy?.user?.name ? successColor : errorColor,
            },
          ]}
          onPress={() => {
            navigation.navigate('RigInspectionScreen', {
              rigId: rig.id,
              dropzoneUserId: dropzoneUser?.id as string,
            })
          }}
        >
          <View style={styles.innerChip}>
            <View style={{ marginRight: 8 }}>
              <MaterialCommunityIcons name="eye-check-outline" color="#FFFFFF" size={18} />
            </View>
            <Text style={{ color: 'white' }}>
              {rigInspection?.inspectedBy?.user?.name || 'Not inspected'}
            </Text>
          </View>
        </Chip>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    height: 24,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    justifyContent: 'space-between',
    flex: 1,
  },
  left: {
    flex: 0.25,
  },
  right: {
    flex: 0.75,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontWeight: '500',
    width: 130,
    textAlign: 'left',
    marginRight: 16,
    marginVertical: 4,
  },
  description: {
    fontWeight: 'normal',
    flexGrow: 1,
  },
});
