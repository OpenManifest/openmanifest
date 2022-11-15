import { format } from 'date-fns';
import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Avatar, Card, Chip, Divider, ProgressBar, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  RigInspectionEssentialsFragment,
  RigEssentialsFragment,
  DropzoneUserEssentialsFragment,
} from 'app/api/operations';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import useRestriction from 'app/hooks/useRestriction';
import useImagePicker from 'app/hooks/useImagePicker';
import Menu, { MenuItem } from 'app/components/popover/Menu';

import useMutationUpdateRig from 'app/api/hooks/useMutationUpdateRig';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { errorColor, successColor } from 'app/constants/Colors';

import { Permission } from 'app/api/schema.d';
import { AvailableRigsDocument, DropzoneUsersDetailedDocument } from 'app/api/reflection';
import { useNotifications } from 'app/providers/notifications';
import { useUserNavigation } from '../useUserNavigation';

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
  const notify = useNotifications();
  const {
    dropzone: { currentUser },
  } = useDropzoneContext();
  const pickImage = useImagePicker();

  const updateRig = useMutationUpdateRig({
    mutation: {
      refetchQueries: [AvailableRigsDocument, DropzoneUsersDetailedDocument],
    },
    onSuccess: () => {
      setUploading(false);
      onSuccessfulImageUpload?.();
      notify.success('Image uploaded');
    },
    onError: (err) => {
      console.log(err);
      setUploading(false);
      notify.error('Upload failed');
    },
  });
  const [isPackingCardMenuOpen, setPackingCardMenuOpen] = React.useState<boolean>(false);

  const onPickImage = React.useCallback(async () => {
    try {
      const result = pickImage();

      setUploading(true);
      // Upload image
      await updateRig.mutate({
        id: Number(rig?.id),
        packingCard: `data:image/jpeg;base64,${result}`,
      });
    } catch (e) {
      console.log(e);
    }
  }, [pickImage, rig?.id, updateRig]);

  const canManageDropzoneRigs = useRestriction(Permission.UpdateDropzoneRig);
  const navigation = useUserNavigation();
  const canUpdateRig =
    currentUser?.user?.id === rig.owner?.id || (rig?.dropzone?.id && canManageDropzoneRigs);

  const theme = useTheme();

  return (
    <Card onPress={onPress} style={{ marginVertical: 16, maxWidth: 500 }}>
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
          setOpen={setPackingCardMenuOpen}
          open={isPackingCardMenuOpen}
          anchor={
            <Chip
              mode="outlined"
              icon="camera"
              style={{ height: 24, alignItems: 'center' }}
              textStyle={{ marginTop: 0 }}
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
          <MenuItem
            title="Upload new"
            icon="camera"
            onPress={() => {
              onPickImage();
              setPackingCardMenuOpen(false);
            }}
          />

          {!rig.packingCard ? null : (
            <>
              <Divider />
              <MenuItem
                title="View"
                icon="eye"
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
            });
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
