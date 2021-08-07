import { format } from 'date-fns';
import * as React from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { Avatar, Card, Chip, Divider, Menu, ProgressBar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import useCurrentDropzone from '../../../api/hooks/useCurrentDropzone';
import useRestriction from '../../../hooks/useRestriction';

import useMutationUpdateRig from '../../../api/hooks/useMutationUpdateRig';
import { actions, useAppDispatch, useAppSelector } from '../../../state';
import { errorColor, successColor } from '../../../constants/Colors';

import { Permission, Rig, RigInspection } from '../../../api/schema.d';

export interface IRigCardProps {
  rig: Rig;
  rigInspection?: RigInspection;
  onSuccessfulImageUpload?(): void;
  onPress?(): void;
}
export default function RigCard(props: IRigCardProps) {
  const { rig, rigInspection, onSuccessfulImageUpload, onPress } = props;
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
      const response = await updateRig.mutate({
        id: Number(rig?.id),
        packingCard: `data:image/jpeg;base64,${result.base64}`,
      });
    } catch (e) {
      console.log(e);
    }
  }, [rig?.id, updateRig]);

  const canManageDropzoneRigs = useRestriction(Permission.UpdateDropzoneRig);
  const canUpdateRig =
    currentUser?.user?.id === rig.user?.id || (rig?.dropzone?.id && canManageDropzoneRigs);

  return (
    <Card onPress={onPress} style={{ marginVertical: 16 }}>
      <ProgressBar visible={isUploading} indeterminate color={accent} />
      <Card.Title title={rig.name || `${rig.make} ${rig.model}`} />
      <Card.Content>
        <View style={styles.content}>
          <View style={styles.left}>
            <Avatar.Icon icon="parachute" size={70} />
          </View>
          <View style={styles.right}>
            <View style={styles.textRow}>
              <Text style={styles.label}>Container</Text>
              <Text style={styles.description}>
                {rig.make} {rig.model}
              </Text>
            </View>
            <View style={styles.textRow}>
              <Text style={styles.label}>Main canopy size</Text>
              <Text style={styles.description}>{rig.canopySize}</Text>
            </View>
            <View style={styles.textRow}>
              <Text style={styles.label}>Repack expiry date</Text>
              <Text style={styles.description}>
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
            style={{ height: 24, marginVertical: 4 }}
            onPress={() => {
              onPickImage();
              setPackingCardMenuOpen(false);
            }}
          />
          <Divider />
          {!rig.packingCard ? null : (
            <Menu.Item
              title="View"
              icon="eye"
              style={{ height: 24, marginVertical: 4 }}
              onPress={() => {
                setPackingCardMenuOpen(false);
                if (rig.packingCard) {
                  dispatch(actions.imageViewer.setOpen(rig.packingCard));
                }
              }}
            />
          )}
        </Menu>

        <Chip
          mode="outlined"
          style={{
            height: 24,
            marginLeft: 8,
            alignItems: 'center',
            backgroundColor: rigInspection?.inspectedBy?.user?.name ? successColor : errorColor,
          }}
        >
          <Text style={{ color: 'white' }}>
            {rigInspection?.inspectedBy?.user?.name || 'Not inspected'}
          </Text>
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
