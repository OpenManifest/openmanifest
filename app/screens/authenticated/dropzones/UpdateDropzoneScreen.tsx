import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button, IconButton, ProgressBar } from 'react-native-paper';
import { gql, useMutation, useQuery } from "@apollo/client";
import { actions, useAppSelector, useAppDispatch } from '../../../state';

import { View } from '../../../components/Themed';
import { Dropzone, Mutation, Query } from '../../../api/schema';
import DropzoneForm from '../../../components/forms/dropzone/DropzoneForm';
import { useNavigation, useRoute } from '@react-navigation/core';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';


const QUERY_DROPZONE_DETAILS = gql`
  query QueryDropzoneDetails($dropzoneId: Int!) {
    dropzone(id: $dropzoneId) {
      id
      name
      primaryColor,
      secondaryColor,
      lat
      lng
      planes {
        id
        name
        registration
      }
      ticketTypes {
        id
        name
      }
    }
  }
`;


const MUTATION_UPDATE_DROPZONE = gql`
  mutation UpdateDropzone(
    $id: Int!,
    $name: String!,
    $banner: String,
    $lat: Float,
    $lng: Float,
    $federationId: Int!
    $primaryColor: String
    $secondaryColor: String
    $isCreditSystemEnabled: Boolean,
    $isPublic: Boolean
  ){
    updateDropzone(input: {
      id: $id
      attributes: {
        name: $name,
        banner: $banner,
        lat: $lat,
        lng: $lng,
        federationId: $federationId
        primaryColor: $primaryColor
        secondaryColor: $secondaryColor
        isCreditSystemEnabled: $isCreditSystemEnabled
        isPublic: $isPublic
      }
    }) {
      dropzone {
        id
        name
        banner
        primaryColor
        secondaryColor,
        isCreditSystemEnabled
        lat
        lng

        planes {
          id
          name
        }

        federation {
          id
          name
        }
      }
    }
  }
`;

export default function UpdateDropzoneScreen() {
  const state = useAppSelector(state => state.forms.dropzone);
  const globalState = useAppSelector(state => state.global);
  const dispatch = useAppDispatch();

  const route = useRoute<{ key: string, name: string, params: { dropzone: Dropzone }}>();
  const dropzone = route.params!.dropzone;
  const navigation = useNavigation();

  const { data, loading } = useQuery<Query>(QUERY_DROPZONE_DETAILS, {
    variables: { dropzoneId: Number(dropzone.id)}
  });

  React.useEffect(() => {
    if (data?.dropzone?.id) {
      console.log('dz', data.dropzone);
      dispatch(actions.forms.dropzone.setOpen(data.dropzone));
    }
  }, [data?.dropzone?.id]);

  const [mutationUpdateDropzone, mutation] = useMutation<Mutation>(MUTATION_UPDATE_DROPZONE);

  const onSave = React.useCallback(async () => {
    let hasError = false;
    const { name, banner, federation, lat, lng, primaryColor, secondaryColor, isCreditSystemEnabled, isPublic } = state.fields;

    if (!name.value?.length || name.value?.length < 3) {
      hasError = true;
      dispatch(
        actions.forms.dropzone.setFieldError(["name", "Name is too short"])
      );
    }

    if (!hasError) {
      try {
        const result = await mutationUpdateDropzone({
          variables: {
            id: Number(dropzone?.id),
            name: name.value,
            lat: lat.value,
            lng: lng.value,
            banner: banner.value || null,
            primaryColor: primaryColor.value,
            secondaryColor: secondaryColor.value,
            federationId: Number(federation?.value?.id),
            isCreditSystemEnabled: !!isCreditSystemEnabled,
            isPublic: !!isPublic
          }
        });

        result?.data?.updateDropzone?.fieldErrors?.map(({ field, message }) => {
          switch (field) {
            case "federation":
            case "federation_id":
              return dispatch(actions.forms.dropzone.setFieldError(["federation", message]));
            case "banner":
              return dispatch(actions.forms.dropzone.setFieldError(["banner", message]));
            case "primary_color":
              return dispatch(actions.forms.dropzone.setFieldError(["primaryColor", message]));
            case "secondary_color":
              return dispatch(actions.forms.dropzone.setFieldError(["secondaryColor", message]));
            case "is_credit_system_enabled":
              return dispatch(actions.forms.dropzone.setFieldError(["isCreditSystemEnabled", message]));
            case "name":
              return dispatch(actions.forms.dropzone.setFieldError(["name", message]));
            case "is_public":
              return dispatch(actions.forms.dropzone.setFieldError(["isPublic", message]));
          }
        });
        if (result?.data?.updateDropzone?.errors?.length) {
          return dispatch(actions.notifications.showSnackbar({
            message: result?.data?.updateDropzone?.errors[0],
            variant: "error"
          }));
        } else if (!result?.data?.updateDropzone?.fieldErrors?.length) {
          // No errors:
          if (result.data?.updateDropzone?.dropzone) {
            dispatch(
              actions.global.setDropzone({
                ...(globalState.currentDropzone || {}),
                ...result?.data?.updateDropzone?.dropzone,
              })
            );
            dispatch(
              actions.notifications.showSnackbar({ message: `Saved`, variant: "success" })
            );
            navigation.goBack();
          }
        }
      } catch (error) {
        dispatch(
          actions.notifications.showSnackbar({ message: error.message, variant: "error" })
        );
      }
    }
    
  }, [JSON.stringify(state.fields), dispatch, mutationUpdateDropzone]);

  return (
    <>
      <ProgressBar indeterminate color={globalState.theme.colors.accent} visible={loading} />
      <ScrollableScreen style={{ backgroundColor: '#f4f5f5' }} contentContainerStyle={styles.content}>
        <DropzoneForm />
        <View style={styles.fields}>
          <Button mode="contained" disabled={mutation.loading} onPress={onSave} loading={mutation.loading}>
            Save
          </Button>
        </View>
      </ScrollableScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    display: "flex",
  },
  content: {
    display: "flex",
    flexGrow: 1,
    alignSelf: "center",
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
    padding: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  fields: {
    width: "100%",
    marginBottom: 16,
  },
  field: {
    marginBottom: 8,
  }
});
