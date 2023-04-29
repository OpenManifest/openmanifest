import * as React from 'react';
import { StyleSheet } from 'react-native';
import { HelperText, Card, List, useTheme, TouchableRipple, Avatar, Title } from 'react-native-paper';
import SkeletonContent from 'app/components/Skeleton';
import { actions, useAppDispatch } from 'app/state';
import LottieView from 'app/components/LottieView';
import useImagePicker from 'app/hooks/useImagePicker';
import ColorPicker from 'app/components/input/colorpicker';
import { PhonePreview, WebPreview } from 'app/components/theme_preview';
import LocationPicker from 'app/components/input/LocationPicker';
import imagePickDark from 'assets/images/image-pick.json';
import imagePickLight from 'assets/images/image-pick-light.json';
import { FederationSelectField } from 'app/components/input/dropdown_select';
import { Control, Controller, useWatch } from 'react-hook-form';
import { DropzoneFields } from './useForm';
import { FormTextField } from 'app/components/input/text/TextField';
import { SwitchField } from 'app/components/input/switch/Switch';

interface IDropzoneForm {
  loading: boolean;
  control?: Control<DropzoneFields>;
}
export default function DropzoneForm(props: IDropzoneForm) {
  const { loading, control } = props;
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const pickImage = useImagePicker();
  const { lat, lng, name, banner, primaryColor } = useWatch({ control });

  return (
    <>
      <SkeletonContent
        isLoading={loading}
        containerStyle={[styles.skeletonCard, { marginTop: 0, paddingHorizontal: 0 }]}
        layout={[{ key: 'box', height: 300, width: '100%' }]}
      >
        <Card
          style={[
            styles.card,
            {
              paddingLeft: 0,
              paddingRight: 0,
              paddingHorizontal: 0,
              marginLeft: 0,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center'
            }
          ]}
        >
          <Card.Content style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Controller
              {...{ control }}
              name="banner"
              render={({ field: { onChange } }) => (
                <TouchableRipple
                  onPress={async () => {
                    try {
                      const base64 = await pickImage();
                      if (base64) {
                        onChange(`data:image/jpeg;base64,${base64}`);
                      }
                    } catch (e) {
                      console.log(e);
                    }
                  }}
                  style={{ width: 185 }}
                >
                  {!banner ? (
                    <LottieView
                      style={{ height: 175, width: 175 }}
                      autoPlay
                      loop={false}
                      source={theme.dark ? imagePickLight : imagePickDark}
                    />
                  ) : (
                    <Avatar.Image
                      size={175}
                      source={{ uri: banner }}
                      style={{
                        borderWidth: StyleSheet.hairlineWidth,
                        backgroundColor: theme.colors.primary
                      }}
                    />
                  )}
                </TouchableRipple>
              )}
            />
            <Title>{name}</Title>
            <HelperText type="info" style={{ marginTop: 16 }}>
              Your banner is displayed on the weather board and on the dropzone selection screen
            </HelperText>
          </Card.Content>
        </Card>
      </SkeletonContent>
      <SkeletonContent
        isLoading={loading}
        containerStyle={styles.skeletonCard}
        layout={[{ key: 'box', height: 300, width: '100%' }]}
      >
        <Card style={styles.card}>
          <List.Subheader>Name</List.Subheader>
          <FormTextField {...{ control }} name="name" mode="outlined" />
          <FederationSelectField {...{ control }} name="federation" />
        </Card>
      </SkeletonContent>

      <SkeletonContent
        isLoading={loading}
        containerStyle={styles.skeletonCard}
        layout={[{ key: 'box', height: 300, width: '100%' }]}
      >
        <Card style={[styles.card, { height: 500, paddingHorizontal: 0 }]}>
          <List.Subheader>Location</List.Subheader>
          <Card.Content
            style={{
              marginTop: 50,
              paddingBottom: 50,
              paddingLeft: 0,
              paddingRight: 0,
              flexGrow: 1
            }}
          >
            <Controller
              {...{ control }}
              name="lat"
              render={({ field: latField }) => (
                <Controller
                  {...{ control }}
                  name="lng"
                  render={({ field: lngField }) => (
                    <LocationPicker
                      value={
                        latField.value && lngField.value ? { lat: latField.value, lng: lngField.value } : undefined
                      }
                      onChange={(region) => {
                        lngField.onChange(region.latitude);
                        latField.onChange(region.longitude);
                      }}
                    />
                  )}
                />
              )}
            />
          </Card.Content>
        </Card>
      </SkeletonContent>

      <SkeletonContent
        isLoading={loading}
        containerStyle={styles.skeletonCard}
        layout={[{ key: 'box', height: 300, width: '100%' }]}
      >
        <Card style={styles.card}>
          <Card.Title title="Branding" />
          <Card.Content
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              alignItems: 'flex-end',
              width: '100%'
            }}
          >
            <PhonePreview primaryColor={primaryColor || '#000000'} />

            <WebPreview primaryColor={primaryColor || '#000000'} />
          </Card.Content>
        </Card>
      </SkeletonContent>

      <SkeletonContent
        isLoading={loading}
        containerStyle={styles.skeletonCardColorPicker}
        layout={[{ key: 'box', height: 200, width: '100%' }]}
      >
        <Controller
          {...{ control }}
          name="primaryColor"
          render={({ field: { onChange, value }, fieldState }) => (
            <ColorPicker
              title="Primary color"
              helperText="Primary color is used for elements like the title bar and the tab bar"
              error={fieldState?.error?.message}
              onChange={(color) => {
                onChange(color);
                dispatch(actions.global.setPrimaryColor(color));
              }}
              value={value || '#000000'}
            />
          )}
        />
      </SkeletonContent>
      <SkeletonContent
        isLoading={loading}
        containerStyle={styles.skeletonCardCheckbox}
        layout={[{ key: 'box', height: 150, width: '100%' }]}
      >
        <Card style={styles.card}>
          <SwitchField
            {...{ control }}
            label="Require Credits"
            name="requireCredits"
            helperText="Users cannot manifest without credits on their account"
          />
          <SwitchField
            {...{ control }}
            label="Manifest can ignore rules"
            name="allowManifestBypass"
            helperText="Manifest can bypass all rules"
          />
          <SwitchField
            {...{ control }}
            label="Allow Negative Credits"
            name="allowNegativeCredits"
            helperText="Allow users to go into negative credits"
          />
          <SwitchField
            {...{ control }}
            label="Require License"
            name="requireLicense"
            helperText="Require users to have a valid license to manifest"
          />
          <SwitchField
            {...{ control }}
            label="Require in-date membership"
            name="requireMembership"
            helperText="Require membership to be in-date"
          />
          <SwitchField
            {...{ control }}
            label="Require Equipment"
            name="requireEquipment"
            helperText="Users cannot manifest without selecting a rig"
          />
          <SwitchField
            {...{ control }}
            label="Require Rig Inspection"
            name="requireRigInspection"
            helperText="Users cannot manifest before their rig is inspected"
          />
          <SwitchField
            {...{ control }}
            label="Allow double manifesting"
            name="allowDoubleManifesting"
            helperText="Users are allowed to manifest on multiple loads"
          />
        </Card>
      </SkeletonContent>
    </>
  );
}

const styles = StyleSheet.create({
  skeletonCard: {
    marginVertical: 16,
    paddingHorizontal: 24,
    width: '100%'
  },
  skeletonCardColorPicker: {
    marginVertical: 16,
    minHeight: 200,
    width: '100%',
    paddingHorizontal: 24
  },
  skeletonCardCheckbox: {
    minHeight: 116,
    marginVertical: 16,
    paddingHorizontal: 24,
    width: '100%'
  },
  card: {
    padding: 16,
    width: '100%'
  },
  fields: {
    flexGrow: 1,
    display: 'flex',
    width: '100%'
  },
  field: {
    marginBottom: 8,
    width: '100%'
  },
  subheader: {
    paddingLeft: 0
  }
});
