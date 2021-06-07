import * as React from 'react';
import { gql, useMutation } from "@apollo/client";

import { actions, useAppSelector, useAppDispatch } from '../../redux';
import { actions as snackbar } from "../../components/notifications";

import { Load, Mutation } from '../../graphql/schema';
import LoadForm from '../forms/load/LoadForm';
import DialogOrSheet from '../layout/DialogOrSheet';


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
      fieldErrors {
        field,
        message
      }
      errors
    }
  }
`;

interface ILoadDialog {
  open: boolean;
  onClose(): void;
  onSuccess(load: Load): void;
}
export default function LoadDialog(props: ILoadDialog) {
  const { open, onClose, onSuccess } = props;
  const state = useAppSelector(state => state.forms.load);
  const globalState = useAppSelector(state => state.global);
  
  const dispatch = useAppDispatch();
  const [mutationCreateLoad, mutation] = useMutation<Mutation>(MUTATION_CREATE_LOAD);

  const validate = React.useCallback((): boolean => {
    let hasError = false;
 
    if (state.fields.maxSlots.value! < 1) {
      hasError = true;
      dispatch(
        actions.forms.load.setFieldError(["maxSlots", "Please specify amount of allowed jumpers"])
      );
    }

    if (!state.fields.plane.value) {
      hasError = true;
      dispatch(
        actions.forms.load.setFieldError(["plane", "What plane is flying this load?"])
      );
    }

    if (!state.fields.gca.value) {
      hasError = true;
      dispatch(
        actions.forms.load.setFieldError(["gca", "You must have a GCA for this load"])
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
            gcaId: gca.value?.user?.id ? Number(gca.value?.user?.id) : null,
            isOpen: !!isOpen.value
          }
        });
        
        result.data?.createLoad?.fieldErrors?.map(({ field, message }) => {
          switch (field) {
            case "name":
              return dispatch(actions.forms.load.setFieldError(["name", message]));
            case "maxSlots":
              return dispatch(actions.forms.load.setFieldError(["maxSlots", message]));
            case "plane":
              return dispatch(actions.forms.load.setFieldError(["plane", message]));
            case "gca":
              return dispatch(actions.forms.load.setFieldError(["gca", message]));
            case "is_open":
              return dispatch(actions.forms.load.setFieldError(["isOpen", message]));
            case "pilot":
              return dispatch(actions.forms.load.setFieldError(["pilot", message]));
          }
        });

        if (result?.data?.createLoad?.errors?.length) {
          return dispatch(
            snackbar.showSnackbar({ message: result.data.createLoad.errors[0], variant: "error" })
          );
        }

        if (result.data?.createLoad?.load) {
          const { load } = result.data.createLoad;
          dispatch(
            snackbar.showSnackbar({ message: `Load ${load.name} created`, variant: "success" })
          );

          if (!result.data?.createLoad?.fieldErrors) {
            onSuccess(result.data.createLoad.load);
            dispatch(actions.forms.load.reset());
          }
        }
      } catch (error) {
        dispatch(
          snackbar.showSnackbar({ message: error.message, variant: "error" })
        );
      }
    }
    
  }, [JSON.stringify(state.fields), dispatch, mutationCreateLoad]);

  return (
    <DialogOrSheet
      open={open}
      onClose={onClose}
      buttonAction={onSave}
      buttonLabel="Create"
      snapPoints={[750, 0]}
      loading={mutation.loading}
      title="New Load"
    >
      <LoadForm />
    </DialogOrSheet>
  );
}
