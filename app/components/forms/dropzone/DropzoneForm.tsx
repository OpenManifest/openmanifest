import * as React from 'react';
import { StyleSheet } from 'react-native';
import {
  TextInput,
  HelperText,
  Card,
  List,
  Checkbox,
  useTheme,
  TouchableRipple,
  Avatar,
  Title
} from 'react-native-paper';
import SkeletonContent from 'app/components/Skeleton';
import { actions, useAppSelector, useAppDispatch } from 'app/state';
import LottieView from 'app/components/LottieView';
import { useFederationsQuery } from 'app/api/reflection';
import useImagePicker from 'app/hooks/useImagePicker';
import { useNavigation } from '@react-navigation/core';
import ColorPicker from '../../input/colorpicker';
import { PhonePreview, WebPreview } from '../../theme_preview';
import FederationSelect from '../../input/dropdown_select/FederationSelect';
import LocationPicker from '../../input/LocationPicker';
import imagePickDark from '../../../../assets/images/image-pick.json';
import imagePickLight from '../../../../assets/images/image-pick-light.json';

interface IDropzoneForm {
  loading: boolean;
}
export default function DropzoneForm(props: IDropzoneForm) {
  const { loading: outsideLoading } = props;
  const state = useAppSelector((root) => root.forms.dropzone);
  const dispatch = useAppDispatch();
  const { data, loading } = useFederationsQuery();
  const theme = useTheme();
  const pickImage = useImagePicker();

  React.useEffect(() => {
    if (data?.federations?.length && !state.fields.federation?.value) {
      dispatch(actions.forms.dropzone.setField(['federation', data.federations[0]]));
    }
  }, [data?.federations, dispatch, state.fields.federation?.value]);

  const onPickImage = React.useCallback(async () => {
    try {
      const base64 = await pickImage();
      if (base64) {
        dispatch(actions.forms.dropzone.setField(['banner', `data:image/jpeg;base64,${base64}`]));
      }
    } catch (e) {
      console.log(e);
    }
  }, [dispatch, pickImage]);

  const navigation = useNavigation();

  React.useEffect(() => {
    navigation.setOptions({ title: state.fields.name.value });
  }, [navigation, state.fields.name.value]);

  return (
    <>
      <SkeletonContent
        isLoading={loading || outsideLoading}
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
            <TouchableRipple onPress={onPickImage} style={{ width: 185 }}>
              {!state?.fields?.banner?.value ? (
                <LottieView
                  style={{ height: 175, width: 175 }}
                  autoPlay
                  loop={false}
                  source={theme.dark ? imagePickLight : imagePickDark}
                />
              ) : (
                <Avatar.Image
                  size={175}
                  source={{ uri: state?.fields?.banner?.value }}
                  style={{
                    borderWidth: StyleSheet.hairlineWidth,
                    backgroundColor: theme.colors.primary
                  }}
                />
              )}
            </TouchableRipple>
            <Title>{state.fields.name.value}</Title>
            <HelperText type="info" style={{ marginTop: 16 }}>
              Your banner is displayed on the weather board and on the dropzone selection screen
            </HelperText>
          </Card.Content>
        </Card>
      </SkeletonContent>
      <SkeletonContent
        isLoading={loading || outsideLoading}
        containerStyle={styles.skeletonCard}
        layout={[{ key: 'box', height: 300, width: '100%' }]}
      >
        <Card style={styles.card}>
          <List.Subheader>Name</List.Subheader>
          <TextInput
            mode="outlined"
            error={!!state.fields.name.error}
            value={state.fields.name.value || ''}
            onChangeText={(newValue) => dispatch(actions.forms.dropzone.setField(['name', newValue]))}
          />
          <HelperText type="error">{state.fields.name.error || ''}</HelperText>
          <FederationSelect
            value={state.fields.federation.value}
            onChange={(value) => dispatch(actions.forms.dropzone.setField(['federation', value]))}
          />
          <HelperText type={state.fields.federation.error ? 'error' : 'info'}>
            {state.fields.federation.error || ''}
          </HelperText>
        </Card>
      </SkeletonContent>

      <SkeletonContent
        isLoading={loading || outsideLoading}
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
            <LocationPicker
              value={
                state.fields.lat.value && state.fields.lng.value
                  ? { lat: state.fields.lat.value, lng: state.fields.lng.value }
                  : undefined
              }
              onChange={(region) => {
                dispatch(actions.forms.dropzone.setField(['lat', region.latitude]));
                dispatch(actions.forms.dropzone.setField(['lng', region.longitude]));
              }}
            />
          </Card.Content>
        </Card>
      </SkeletonContent>

      <SkeletonContent
        isLoading={loading || outsideLoading}
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
            <PhonePreview primaryColor={state.fields.primaryColor.value || '#000000'} />

            <WebPreview primaryColor={state.fields.primaryColor.value || '#000000'} />
          </Card.Content>
        </Card>
      </SkeletonContent>

      <SkeletonContent
        isLoading={loading || outsideLoading}
        containerStyle={styles.skeletonCardColorPicker}
        layout={[{ key: 'box', height: 200, width: '100%' }]}
      >
        <ColorPicker
          title="Primary color"
          helperText="Primary color is used for elements like the title bar and the tab bar"
          error={state.fields.primaryColor.error || null}
          onChange={(color) => {
            dispatch(actions.forms.dropzone.setField(['primaryColor', color]));
            dispatch(actions.global.setPrimaryColor(color));
          }}
          value={state.fields.primaryColor.value || '#000000'}
        />
      </SkeletonContent>
      <SkeletonContent
        isLoading={loading || outsideLoading}
        containerStyle={styles.skeletonCardCheckbox}
        layout={[{ key: 'box', height: 150, width: '100%' }]}
      >
        <Card style={styles.card}>
          <List.Item
            descriptionNumberOfLines={10}
            title="Use credit system"
            description="Users will be charged credits when a load is marked as landed and can't manifest with insufficient funds."
            onPress={() =>
              dispatch(
                actions.forms.dropzone.setField(['isCreditSystemEnabled', !state.fields.isCreditSystemEnabled.value])
              )
            }
            left={() => (
              <Checkbox
                onPress={() =>
                  dispatch(
                    actions.forms.dropzone.setField([
                      'isCreditSystemEnabled',
                      !state.fields.isCreditSystemEnabled.value
                    ])
                  )
                }
                status={state.fields.isCreditSystemEnabled.value ? 'checked' : 'unchecked'}
              />
            )}
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
