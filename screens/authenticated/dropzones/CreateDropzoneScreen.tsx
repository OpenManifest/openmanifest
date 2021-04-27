import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/core';
import { useAppSelector, useAppDispatch, snackbarActions } from '../../../redux';

import { Text, View } from '../../../components/Themed';
import { actions as snackbar } from "../../../components/notifications";
import globalSlice from "../../../redux/global";

import slice from "../../../components/forms/dropzone/slice";
import { Mutation } from '../../../graphql/schema';
import DropzoneForm from '../../../components/forms/dropzone/DropzoneForm';
import useMutationCreateDropzone from '../../../graphql/hooks/useMutationCreateDropzone';
import ScrollableScreen from '../../../components/ScrollableScreen';

const { actions } = slice;
const { actions: globalActions } = globalSlice;




export default function SignupScreen() {
  const state = useAppSelector(state => state.dropzoneForm);
  const dispatch = useAppDispatch();

  const navigation = useNavigation();

  const createDropzone = useMutationCreateDropzone({
    onError: (e: string) => dispatch(snackbarActions.showSnackbar({ message: e, variant: "error"})),
    onFieldError: (field, error) =>
      dispatch(actions.setFieldError([field as string, error])),
    onSuccess: (payload) => dispatch(globalActions.setDropzone(payload.dropzone!)),
  })

  return (
    <ScrollableScreen contentContainerStyle={{ paddingHorizontal: 32 }}>
        <DropzoneForm />
        <View style={styles.fields}>
          <Button
            mode="contained"
            disabled={createDropzone.loading}
            loading={createDropzone.loading}
            onPress={() => 
              createDropzone.mutate({
                name: state.fields.name.value!,
                banner: state.fields.banner.value!,
                federationId: Number(state.fields.federation.value!.id),
              })
            }
          >
            Save
          </Button>
      </View>
    </ScrollableScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
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
    width: "100%"
  },
  field: {
    marginBottom: 8,
  }
});
