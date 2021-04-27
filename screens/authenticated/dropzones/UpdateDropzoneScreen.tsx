import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, ProgressBar } from 'react-native-paper';
import { gql, useMutation, useQuery } from "@apollo/client";
import { useAppSelector, useAppDispatch, snackbarActions } from '../../../redux';

import { View } from '../../../components/Themed';
import { actions as snackbar } from "../../../components/notifications";
import globalSlice from "../../../redux/global";

import slice from "../../../components/forms/dropzone/slice";
import { Dropzone, Mutation, Query } from '../../../graphql/schema';
import DropzoneForm from '../../../components/forms/dropzone/DropzoneForm';
import { useNavigation, useRoute } from '@react-navigation/core';
import ScrollableScreen from '../../../components/ScrollableScreen';

const { actions } = slice;
const { actions: globalActions } = globalSlice;

const QUERY_DROPZONE_DETAILS = gql`
  query QueryDropzoneDetails($dropzoneId: Int!) {
    dropzone(id: $dropzoneId) {
      id
      name
      primaryColor,
      secondaryColor,
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
  const state = useAppSelector(state => state.dropzoneForm);
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
      dispatch(actions.setOriginal(data.dropzone));
    }
  }, [data?.dropzone?.id]);

  const [mutationUpdateDropzone, mutation] = useMutation<Mutation>(MUTATION_UPDATE_DROPZONE);

  const onSave = React.useCallback(async () => {
    let hasError = false;
    const { name, banner, federation, primaryColor, secondaryColor, isCreditSystemEnabled, isPublic } = state.fields;

    if (!name.value?.length || name.value?.length < 3) {
      hasError = true;
      dispatch(
        actions.setFieldError(["name", "Name is too short"])
      );
    }

    if (!hasError) {
      try {
        const result = await mutationUpdateDropzone({
          variables: {
            id: Number(dropzone?.id),
            name: name.value,
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
              return dispatch(actions.setFieldError(["federation", message]));
            case "banner":
              return dispatch(actions.setFieldError(["banner", message]));
            case "primary_color":
              return dispatch(actions.setFieldError(["primaryColor", message]));
            case "secondary_color":
              return dispatch(actions.setFieldError(["secondaryColor", message]));
            case "is_credit_system_enabled":
              return dispatch(actions.setFieldError(["isCreditSystemEnabled", message]));
            case "name":
              return dispatch(actions.setFieldError(["name", message]));
            case "is_public":
              return dispatch(actions.setFieldError(["isPublic", message]));
          }
        });
        if (result?.data?.updateDropzone?.errors?.length) {
          return dispatch(snackbarActions.showSnackbar({
            message: result?.data?.updateDropzone?.errors[0],
            variant: "error"
          }));
        } else if (!result?.data?.updateDropzone?.fieldErrors?.length) {
          // No errors:
          if (result.data?.updateDropzone?.dropzone) {
            dispatch(
              globalActions.setDropzone({
                ...(globalState.currentDropzone || {}),
                ...result?.data?.updateDropzone?.dropzone,
              })
            );
            dispatch(
              snackbar.showSnackbar({ message: `Saved`, variant: "success" })
            );
            navigation.goBack();
          }
        }
      } catch (error) {
        dispatch(
          snackbar.showSnackbar({ message: error.message, variant: "error" })
        );
      }
    }
    
  }, [JSON.stringify(state.fields), dispatch, mutationUpdateDropzone]);

  return (
    <>
    <ProgressBar indeterminate color={globalState.theme.colors.accent} visible={loading} />
    <ScrollableScreen contentContainerStyle={styles.content}>
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
    alignItems: 'center',
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
    width: "70%",
    marginBottom: 16,
  },
  field: {
    marginBottom: 8,
  }
});
