import * as React from 'react';
import { gql, useMutation } from "@apollo/client";
import { actions, useAppSelector, useAppDispatch,  } from '../../redux';

import { Mutation } from '../../graphql/schema';
import PlaneForm from '../forms/plane/PlaneForm';
import DialogOrSheet from "../layout/DialogOrSheet";


const MUTATION_UPDATE_PLANE = gql`
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
        ...plane,

        dropzone {
          id
          planes {
            ...plane
          }
        }
      }
    }
  }
  fragment plane on Plane {
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
`;

interface IPlaneDialogProps {
  open: boolean;
  onClose(): void;
}

export default function CreatePlaneScreen(props: IPlaneDialogProps) {
  const { open, onClose } = props;
  const globalState = useAppSelector(state => state.global);
  const state = useAppSelector(state => state.forms.plane);
  const dispatch = useAppDispatch();


  const [mutationCreatePlane, create] = useMutation<Mutation>(MUTATION_CREATE_PLANE);
  const [mutationUpdatePlane, update] = useMutation<Mutation>(MUTATION_UPDATE_PLANE);


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

    const mutation = state.original?.id
      ? mutationUpdatePlane
      : mutationCreatePlane;

    if (validate()) {
      try {
        const result = await mutation({
          variables: {
            ...state.original?.id ? { id: Number(state.original.id) } : { dropzoneId: Number(globalState.currentDropzone?.id), },
            name: name.value,
            registration: registration.value,
            minSlots: minSlots.value,
            maxSlots: maxSlots.value,
            hours: hours.value,
            nextMaintenanceHours: nextMaintenanceHours.value,
          }
        });

        const payload = state.original?.id
          ? result?.data?.updatePlane
          : result?.data?.createPlane;

        if (payload?.fieldErrors?.length) {
          payload.fieldErrors.forEach(({ field, message }) => {
            switch (field) {
              case "max_slots":
                return dispatch(actions.forms.plane.setFieldError(["maxSlots", message]));
              case "name":
                return dispatch(actions.forms.plane.setFieldError(["name", message]));
              case "minSlots":
                return dispatch(actions.forms.plane.setFieldError(["minSlots", message]));
              case "hours":
                return dispatch(actions.forms.plane.setFieldError(["hours", message]));
              case "next_maintenance_hours":
                return dispatch(actions.forms.plane.setFieldError(["nextMaintenanceHours", message]));
              case "registration":
                return dispatch(actions.forms.plane.setFieldError(["registration", message]));
            }
          })
          return;
        }
        
        if (payload?.plane) {
          const plane = payload?.plane;
          dispatch(
            actions.notifications.showSnackbar({ message: `Added plane ${plane.name}`, variant: "success" })
          );
          onClose();
          dispatch(
            actions.forms.plane.reset()
          );
        }
      } catch (error) {
        dispatch(
          actions.notifications.showSnackbar({ message: error.message, variant: "error" })
        );
      }
    }
    
  }, [JSON.stringify(state.fields), dispatch, mutationCreatePlane]);

  return (
    <DialogOrSheet
      title={ state.original?.id ? "Edit aircraft" : "New aircraft"}
      open={open}
      snapPoints={[0, 580]}
      buttonLabel="Save"
      buttonAction={onSave}
      loading={create.loading || update.loading}
      onClose={() => {
        onClose();
        dispatch(actions.forms.plane.reset());
      }}
    >
        <PlaneForm />
    </DialogOrSheet>
  );
}
