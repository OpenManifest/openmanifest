import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { gql, useMutation } from "@apollo/client";
import { useAppSelector, useAppDispatch, dropzoneForm } from '../../../redux';

import { View } from '../../../components/Themed';
import { actions as snackbar } from "../../../components/notifications";
import globalSlice from "../../../redux/global";

import slice from "../../../components/forms/plane/slice";
import { Mutation } from '../../../graphql/schema';
import PlaneForm from '../../../components/forms/plane/PlaneForm';
import { useNavigation } from '@react-navigation/core';

const { actions } = slice;
const { actions: globalActions } = globalSlice;


const MUTATION_CREATE_PLANE = gql`
  mutation CreatePlane(
    $name: String!,
    $registration: String!,
    $dropzoneId: Int!
    $minSlots: Int!
    $maxSlots: Int!
    $hours: Int
    $nextMaintenanceHours: Int
  ){
    createPlane(input: {
      attributes: {
        name: $name,
        registration: $registration,
        dropzoneId: $dropzoneId
        minSlots: $minSlots
        maxSlots: $maxSlots
        hours: $hours
        nextMaintenanceHours: $nextMaintenanceHours
      }
    }) {
      plane {
        id
        name
        registration
        minSlots
        maxSlots
        hours
        nextMaintenanceHours

        dropzone {
          id
          name
          planes {
            id
            name
            registration
            minSlots
            maxSlots
            hours
            nextMaintenanceHours
          }
        }
      }
    }
  }
`;

export default function CreatePlaneScreen() {
  const { planeForm: state, global: globalState } = useAppSelector(state => state);
  const dispatch = useAppDispatch();

  const navigation = useNavigation();

  const [mutationCreatePlane, data] = useMutation<Mutation>(MUTATION_CREATE_PLANE);

  const validate = React.useCallback((): boolean => {
    let hasError = false;
    if (state.fields.name.value.length < 3) {
      hasError = true;
      dispatch(
        actions.setFieldError(["name", "Name is too short"])
      );
    }

    if (state.fields.registration.value.length < 3) {
      hasError = true;
      dispatch(
        actions.setFieldError(["registration", "Registration is too short"])
      );
    }

    if (!state.fields.maxSlots.value) {
      hasError = true;
      dispatch(
        actions.setFieldError(["maxSlots", "Max slots must be specified"])
      );
    }

    return !hasError;
  }, [JSON.stringify(state.fields), dispatch]);

  const onSave = React.useCallback(async () => {
    const { name, registration, maxSlots, minSlots, hours, nextMaintenanceHours } = state.fields;

    

    if (validate()) {
      try {
        const result = await mutationCreatePlane({
          variables: {
            dropzoneId: Number(globalState.currentDropzone?.id),
            name: name.value,
            registration: registration.value,
            minSlots: minSlots.value,
            maxSlots: maxSlots.value,
            hours: hours.value,
            nextMaintenanceHours: nextMaintenanceHours.value,
          }
        });
        
        if (result.data?.createPlane?.plane) {
          const { plane } = result.data.createPlane;
          dispatch(
            snackbar.showSnackbar({ message: `Added plane ${plane.name}`, variant: "success" })
          );
          navigation.goBack();
        }
      } catch (error) {
        dispatch(
          snackbar.showSnackbar({ message: error.message, variant: "error" })
        );
      }
    }
    
  }, [JSON.stringify(state.fields), dispatch, mutationCreatePlane]);

  return (
    <View style={styles.container}>
        <PlaneForm />
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
