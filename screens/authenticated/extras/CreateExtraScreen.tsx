import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { gql, useMutation } from "@apollo/client";
import { useAppSelector, useAppDispatch, dropzoneForm } from '../../../redux';

import { View } from '../../../components/Themed';
import { actions as snackbar } from "../../../components/notifications";
import globalSlice from "../../../redux/global";

import slice from "../../../components/forms/extra/slice";
import { Mutation } from '../../../graphql/schema';
import ExtraForm from '../../../components/forms/extra/ExtraForm';
import { useIsFocused, useNavigation } from '@react-navigation/core';
import ScrollableScreen from '../../../components/ScrollableScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { actions } = slice;
const { actions: globalActions } = globalSlice;


const MUTATION_CREATE_EXTRA = gql`
  mutation CreateExtra(
    $name: String,
    $ticketTypeIds: [Int!]
    $cost: Float
    $dropzoneId: Int
  ){
    createExtra(input: {
      attributes: {
        name: $name,
        ticketTypeIds: $ticketTypeIds
        cost: $cost
        dropzoneId: $dropzoneId
      }
    }) {
      extra {
        id
        name

        ticketTypes {
          id
          name
          cost
          altitude
          allowManifestingSelf
        }
      }
    }
  }
`;

export default function CreateExtraScreen() {
  const { extraForm: state, global: globalState } = useAppSelector(state => state);
  const dispatch = useAppDispatch();

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  React.useEffect(() => {
    if (isFocused) {
      dispatch(actions.reset());
    }
  }, [isFocused]);

  const [mutationCreateExtra, data] = useMutation<Mutation>(MUTATION_CREATE_EXTRA);

  const validate = React.useCallback((): boolean => {
    let hasError = false;
    if (state.fields.name.value.length < 3) {
      hasError = true;
      dispatch(
        actions.setFieldError(["name", "Name is too short"])
      );
    }

    if (Number(state.fields.cost.value) < 0) {
      hasError = true;
      dispatch(
        actions.setFieldError(["cost", "Price must be a number"])
      );
    }


    return !hasError;
  }, [JSON.stringify(state.fields), dispatch]);

  const onSave = React.useCallback(async () => {
    const { name, cost, ticketTypeIds } = state.fields;

    

    if (validate()) {
      try {
        const result = await mutationCreateExtra({
          variables: {
            dropzoneId: Number(globalState.currentDropzone?.id),
            name: name.value,
            cost: cost.value,
            ticketTypeIds: ticketTypeIds.value,
          }
        });
        
        if (result.data?.createExtra?.extra) {
          const { extra } = result.data.createExtra;
          dispatch(
            snackbar.showSnackbar({ message: `Added extra ${extra.name}`, variant: "success" })
          );
          navigation.goBack();
        }
      } catch (error) {
        dispatch(
          snackbar.showSnackbar({ message: error.message, variant: "error" })
        );
      }
    }
    
  }, [JSON.stringify(state.fields), dispatch, mutationCreateExtra]);

  return (
    <ScrollableScreen contentContainerStyle={{ paddingHorizontal: 48 }}>
        <MaterialCommunityIcons name="ticket-percent" size={100} color="#999999" style={{ alignSelf: "center" }} />
        <ExtraForm />
        <View style={styles.fields}>
          <Button mode="contained" disabled={data.loading} onPress={onSave} loading={data.loading}>
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
    width: "100%",
    marginBottom: 16
  },
  field: {
    width: "100%",
    marginBottom: 8,
  }
});
