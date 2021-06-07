import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { gql, useMutation } from "@apollo/client";
import { useNavigation, useRoute } from '@react-navigation/core';
import { actions, useAppSelector, useAppDispatch } from '../../../redux';

import { View } from '../../../components/Themed';
import { actions as snackbar } from "../../../components/notifications";

import { Mutation, Plane } from '../../../graphql/schema';
import PlaneForm from '../../../components/forms/plane/PlaneForm';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const MUTATION_CREATE_PLANE = gql`
  mutation UpdatePlane(
    $id: Int!,
    $name: String!,
    $registration: String!,
    $minSlots: Int!
    $maxSlots: Int!
    $hours: Int
    $nextMaintenanceHours: Int
  ){
    updatePlane(input: {
      id: $id
      attributes: {
        name: $name,
        registration: $registration,
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

export default function UpdatePlaneScreen() {
  const state = useAppSelector(state => state.forms.plane);
  const globalState = useAppSelector(state => state.global);
  const dispatch = useAppDispatch();

  const navigation = useNavigation();
  const route = useRoute<{ key: string, name: string, params: { plane: Plane }}>();
  const plane = route.params!.plane;

  React.useEffect(() => {
    dispatch(actions.forms.plane.setOriginal(plane));
  }, [plane?.id]);

  const [mutationUpdatePlane, data] = useMutation<Mutation>(MUTATION_CREATE_PLANE);

  const validate = React.useCallback((): boolean => {
    let hasError = false;
    if (state.fields.name.value.length < 3) {
      hasError = true;
      dispatch(
        actions.forms.plane.setFieldError(["name", "Name is too short"])
      );
    }

    if (state.fields.registration.value.length < 3) {
      hasError = true;
      dispatch(
        actions.forms.plane.setFieldError(["registration", "Registration is too short"])
      );
    }

    if (!state.fields.maxSlots.value) {
      hasError = true;
      dispatch(
        actions.forms.plane.setFieldError(["maxSlots", "Max slots must be specified"])
      );
    }

    return !hasError;
  }, [JSON.stringify(state.fields), dispatch]);

  const onSave = React.useCallback(async () => {
    const { name, registration, maxSlots, minSlots, hours, nextMaintenanceHours } = state.fields;

    

    if (validate()) {
      try {
        const result = await mutationUpdatePlane({
          variables: {
            id: Number(state.original!.id!),
            name: name.value,
            registration: registration.value,
            minSlots: minSlots.value,
            maxSlots: maxSlots.value,
            hours: hours.value,
            nextMaintenanceHours: nextMaintenanceHours.value,
          }
        });
        
        if (result.data?.updatePlane?.plane) {
          const { plane } = result.data.updatePlane;
          dispatch(
            snackbar.showSnackbar({ message: `Saved plane ${plane.name}`, variant: "success" })
          );
          navigation.goBack();
        }
      } catch (error) {
        dispatch(
          snackbar.showSnackbar({ message: error.message, variant: "error" })
        );
      }
    }
    
  }, [JSON.stringify(state.fields), dispatch, mutationUpdatePlane]);

  return (
    <ScrollableScreen contentContainerStyle={styles.content}>
        <MaterialCommunityIcons name="airplane" size={100} color="#999999" style={{ alignSelf: "center" }} />
        <PlaneForm />
        <View style={styles.actions}>
          <Button mode="contained" disabled={data.loading} onPress={onSave} loading={data.loading}>
            Save
          </Button>
      </View>
    </ScrollableScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 48,
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
  actions: {
    width: "100%",
    marginBottom: 16
  },
  field: {
    marginBottom: 8,
  }
});
