import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, TextInput, HelperText, Card, List, Checkbox } from 'react-native-paper';
import { getDocumentAsync } from 'expo-document-picker';
import { useQuery, gql } from '@apollo/client';
import SkeletonContent from 'react-native-skeleton-content';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import { actions, useAppSelector, useAppDispatch } from '../../../state';
import useCurrentDropzone from '../../../api/hooks/useCurrentDropzone';
import ColorPicker from '../../input/colorpicker';
import { Query } from '../../../api/schema';
import { PhonePreview, WebPreview } from '../../theme_preview';
import FederationSelect from '../../input/dropdown_select/FederationSelect';
import LocationPicker from '../../input/LocationPicker';
import { warningColor } from '../../../constants/Colors';

const QUERY_FEDERATIONS = gql`
  query QueryFederations {
    federations {
      id
      name
    }
  }
`;

interface IDropzoneForm {
  loading: boolean;
}
export default function DropzoneForm(props: IDropzoneForm) {
  const { loading: outsideLoading } = props;
  const state = useAppSelector((root) => root.forms.dropzone);
  const dispatch = useAppDispatch();
  const { data, loading } = useQuery<Query>(QUERY_FEDERATIONS);
  const { currentUser } = useCurrentDropzone();

  React.useEffect(() => {
    if (data?.federations?.length && !state.fields.federation?.value) {
      dispatch(actions.forms.dropzone.setField(['federation', data.federations[0]]));
    }
  }, [data?.federations, dispatch, state.fields.federation?.value]);

  const onPickImage = React.useCallback(async () => {
    try {
      const result = (await getDocumentAsync({
        multiple: false,
        type: 'image',
      })) as { uri: string };

      dispatch(actions.forms.dropzone.setField(['banner', result.uri as string]));
    } catch (e) {
      console.log(e);
    }
  }, [dispatch]);

  return (
    <>
      <SkeletonContent
        isLoading={loading || outsideLoading}
        containerStyle={styles.skeletonCard}
        layout={[{ key: 'box', height: 300, width: '100%' }]}
      >
        <Card style={styles.card}>
          <Card.Title title="Banner" />
          <Card.Cover
            source={{
              uri: state.fields.banner.value || 'https://picsum.photos/700',
            }}
            resizeMode="cover"
            style={{ width: '100%' }}
          />
          <Card.Actions style={{ justifyContent: 'flex-end' }}>
            <Button onPress={onPickImage}>Upload</Button>
          </Card.Actions>
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
            onChangeText={(newValue) =>
              dispatch(actions.forms.dropzone.setField(['name', newValue]))
            }
          />
          <HelperText type="error">{state.fields.name.error || ''}</HelperText>
          <FederationSelect
            value={state.fields.federation.value}
            onSelect={(value) => dispatch(actions.forms.dropzone.setField(['federation', value]))}
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
              flexGrow: 1,
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
              width: '100%',
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
            // eslint-disable-next-line max-len
            description="Users will be charged credits when a load is marked as landed and can't manifest with insufficient funds."
            onPress={() =>
              dispatch(
                actions.forms.dropzone.setField([
                  'isCreditSystemEnabled',
                  !state.fields.isCreditSystemEnabled.value,
                ])
              )
            }
            left={() => (
              <Checkbox
                onPress={() =>
                  dispatch(
                    actions.forms.dropzone.setField([
                      'isCreditSystemEnabled',
                      !state.fields.isCreditSystemEnabled.value,
                    ])
                  )
                }
                status={state.fields.isCreditSystemEnabled.value ? 'checked' : 'unchecked'}
              />
            )}
          />
        </Card>
      </SkeletonContent>
      <SkeletonContent
        isLoading={loading || outsideLoading}
        containerStyle={styles.skeletonCardCheckbox}
        layout={[{ key: 'box', height: 150, width: '100%' }]}
      >
        <Card style={styles.card}>
          <List.Item
            title={
              state?.original?.requestPublication && !state.original?.isPublic
                ? 'Awaiting review'
                : 'Request Publication'
            }
            description={
              state?.original?.requestPublication && !state.original?.isPublic
                ? 'You will be contacted to verify the legitimacy of your dropzone before your dropzone is publicly available. This is to prevent illegitimate actors on the platform. Thank you for your patience and understanding.'
                : 'Your dropzone will not be visible to other users until it is published. You can request a review to publish your dropzone, and may be contacted for verification on the email or phone number on your profile.'
            }
            descriptionNumberOfLines={10}
            onPress={() => {
              dispatch(
                actions.forms.dropzone.setField([
                  'requestPublication',
                  !state.fields.requestPublication?.value,
                ])
              );
              if (state.fields.isPublic) {
                dispatch(
                  actions.forms.dropzone.setField(['isPublic', !state.fields.isPublic?.value])
                );
              }
            }}
            left={(iconProps) => {
              const extraProps = {
                icon: undefined as IconSource | undefined,
                color: undefined as string | undefined,
              };

              if (state.fields.requestPublication?.value) {
                extraProps.icon = 'upload';
              }

              if (state.original?.requestPublication && state.fields.requestPublication?.value) {
                extraProps.color = warningColor;
                extraProps.icon = 'progress-upload';
              }

              if (state.original?.isPublic && state.fields?.isPublic.value) {
                extraProps.icon = 'check';
              }

              if (extraProps.icon) {
                return <List.Icon {...iconProps} {...extraProps} />;
              }
              return <View style={{ width: 56, height: 56 }} />;
            }}
          />
          {currentUser?.user?.moderationRole === 'administrator' &&
          state?.original?.requestPublication ? (
            <Card.Actions>
              <Button
                onPress={() => dispatch(actions.forms.dropzone.setField(['isPublic', false]))}
              >
                Decline
              </Button>
              <Button onPress={() => dispatch(actions.forms.dropzone.setField(['isPublic', true]))}>
                Accept
              </Button>
            </Card.Actions>
          ) : null}
        </Card>
      </SkeletonContent>
    </>
  );
}

const styles = StyleSheet.create({
  skeletonCard: {
    marginVertical: 16,
    width: '100%',
  },
  skeletonCardColorPicker: {
    marginVertical: 16,
    minHeight: 200,
    width: '100%',
  },
  skeletonCardCheckbox: {
    minHeight: 116,
    marginVertical: 16,
    width: '100%',
  },
  card: {
    padding: 16,
    width: '100%',
  },
  fields: {
    flexGrow: 1,
    display: 'flex',
    width: '100%',
  },
  field: {
    marginBottom: 8,
    width: '100%',
  },
  subheader: {
    paddingLeft: 0,
  },
});
