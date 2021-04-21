import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { gql, useMutation } from "@apollo/client";
import { useAppSelector, useAppDispatch } from '../../../redux';

import { View } from '../../../components/Themed';
import { actions as snackbar } from "../../../components/notifications";
import globalSlice from "../../../redux/global";

import slice from "../../../components/forms/dropzone/slice";
import { Dropzone, Mutation } from '../../../graphql/schema';
import DropzoneForm from '../../../components/forms/dropzone/DropzoneForm';
import { useNavigation, useRoute } from '@react-navigation/core';
import ScrollableScreen from '../../../components/ScrollableScreen';

const { actions } = slice;
const { actions: globalActions } = globalSlice;


const MUTATION_UPDATE_DROPZONE = gql`
  mutation UpdateDropzone(
    $id: Int!,
    $name: String!,
    $banner: String,
    $federationId: Int!
    $primaryColor: String
    $secondaryColor: String
  ){
    updateDropzone(input: {
    id: $id
    attributes: {
      name: $name,
      banner: $banner,
      federationId: $federationId
      primaryColor: $primaryColor
      secondaryColor: $secondaryColor
    }
  }) {
      dropzone {
        id
        name
        banner
        primaryColor
        secondaryColor,

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
  const dispatch = useAppDispatch();

  const navigation = useNavigation();
  const route = useRoute<{ key: string, name: string, params: { dropzone: Dropzone }}>();
  const dropzone = route.params!.dropzone;

  React.useEffect(() => {
    dispatch(actions.setOriginal(dropzone));
  }, [dropzone?.id]);
  

  const [mutationUpdateDropzone, data] = useMutation<Mutation>(MUTATION_UPDATE_DROPZONE);

  const onSave = React.useCallback(async () => {
    let hasError = false;
    const { name, banner, federation, primaryColor, secondaryColor } = state.fields;

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
          }
        });
        
        if (result.data?.updateDropzone?.dropzone) {
          const { dropzone } = result.data.updateDropzone;
          dispatch(
            globalActions.setDropzone(dropzone)
          );
          dispatch(
            snackbar.showSnackbar({ message: `Saved`, variant: "success" })
          );
        }
      } catch (error) {
        dispatch(
          snackbar.showSnackbar({ message: error.message, variant: "error" })
        );
      }
    }
    
  }, [JSON.stringify(state.fields), dispatch, mutationUpdateDropzone]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <DropzoneForm />
      <View style={styles.fields}>
        <Button mode="contained" disabled={data.loading} onPress={onSave} loading={data.loading}>
          Save
        </Button>
      </View>
    </ScrollView>
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
    paddingBottom: 56,
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
