import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { gql, useMutation } from "@apollo/client";
import { useAppSelector, useAppDispatch, dropzoneForm } from '../../../redux';
import { useNavigation } from '@react-navigation/core';

import { View } from '../../../components/Themed';
import { actions as snackbar } from "../../../components/notifications";
import globalSlice from "../../../redux/global";

import slice from "../../../components/forms/load/slice";
import { Mutation } from '../../../graphql/schema';
import LoadForm from '../../../components/forms/load/LoadForm';

const { actions } = slice;
const { actions: globalActions } = globalSlice;


const MUTATION_CREATE_LOAD = gql`
  mutation CreateLoad(
    $name: String,
    $pilotId: Int,
    $gcaId: Int,
    $maxSlots: Int!,
    $planeId: Int,
    $isOpen: Boolean,
  ){
    createLoad(input: {
      attributes: {
        name: $name,
        pilotId: $pilotId,
        gcaId: $gcaId,
        maxSlots: $maxSlots,
        planeId: $planeId,
        isOpen: $isOpen,
      }
    }) {
      load {
        id
        name
        pilot {
          id
          user {
            id 
            name
          }
        }
        gca {
          id
          user {
            id 
            name
          }
        }
        maxSlots
        isOpen
      }
    }
  }
`;

export default function CreateLoadScreen() {
  const { loadForm: state, global: globalState } = useAppSelector(state => state);
  const dispatch = useAppDispatch();

  const navigation = useNavigation();

  const [mutationCreateLoad, data] = useMutation<Mutation>(MUTATION_CREATE_LOAD);

  const validate = React.useCallback((): boolean => {
    let hasError = false;
    if ((state.fields.name?.value?.length || 0) < 3) {
      hasError = true;
      dispatch(
        actions.setFieldError(["name", "Name is too short"])
      );
    }

    if (state.fields.maxSlots.value! < 1) {
      hasError = true;
      dispatch(
        actions.setFieldError(["maxSlots", "Please specify amount of allowed jumpers"])
      );
    }

    if (!state.fields.plane.value) {
      hasError = true;
      dispatch(
        actions.setFieldError(["plane", "What plane is flying this load?"])
      );
    }

    if (!state.fields.gca.value) {
      hasError = true;
      dispatch(
        actions.setFieldError(["gca", "You must have a GCA for this load"])
      );
    }

    return !hasError;
  }, [JSON.stringify(state.fields), dispatch]);

  const onSave = React.useCallback(async () => {
    const { name, gca, loadMaster, plane, maxSlots, pilot, isOpen } = state.fields;

    

    if (validate()) {
      try {
        const result = await mutationCreateLoad({
          variables: {
            dropzoneId: Number(globalState.currentDropzone?.id),
            name: name.value,
            maxSlots: maxSlots.value,
            planeId: plane.value?.id ? Number(plane.value?.id) : null,
            pilotId: pilot.value?.id ? Number(plane.value?.id) : null,
            gcaId: gca.value?.id ? Number(gca.value?.id) : null,
            isOpen: !!isOpen.value
          }
        });
        
        if (result.data?.createLoad?.load) {
          const { load } = result.data.createLoad;
          dispatch(
            snackbar.showSnackbar({ message: `Load ${load.name} created`, variant: "success" })
          );
          navigation.goBack();
        }
      } catch (error) {
        dispatch(
          snackbar.showSnackbar({ message: error.message, variant: "error" })
        );
      }
    }
    
  }, [JSON.stringify(state.fields), dispatch, mutationCreateLoad]);

  return (
    <View style={styles.container}>
        <LoadForm />
        <View style={styles.fields}>
          <Button mode="contained" disabled={data.loading} onPress={onSave} loading={data.loading}>
            Save
          </Button>
      </View>
    </View>
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
    width: "70%",
    marginBottom: 16
  },
  field: {
    marginBottom: 8,
  }
});
