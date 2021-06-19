import * as React from 'react';
import { gql, useMutation } from "@apollo/client";
import { actions, useAppSelector, useAppDispatch } from '../../redux';
import { Mutation } from '../../graphql/schema';
import ExtraForm from '../../components/forms/extra/ExtraForm';
import DialogOrSheet from '../layout/DialogOrSheet';
import useCurrentDropzone from '../../graphql/hooks/useCurrentDropzone';


const MUTATION_UPDATE_EXTRA = gql`
  mutation UpdateExtra(
    $id: Int!,
    $name: String,
    $ticketTypeIds: [Int!]
    $cost: Float
    $dropzoneId: Int
  ){
    updateExtra(input: {
      id: $id
      attributes: {
        name: $name,
        ticketTypeIds: $ticketTypeIds
        cost: $cost
        dropzoneId: $dropzoneId
      }
    }) {
      extra {
        ...extra

        dropzone {
          id
          extras {
            ...extra
          }
        }
      }
    }
  }

  fragment extra on Extra {
    id
    name
    cost

    ticketTypes {
      id
      name
      cost
      altitude
      allowManifestingSelf
    }
  }
`;

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
        ...extra

        dropzone {
          id
          extras {
            ...extra
          }
        }
      }
    }
  }

  fragment extra on Extra {
    id
    name
    cost

    ticketTypes {
      id
      name
      cost
      altitude
      allowManifestingSelf
    }
  }
`;


interface ITicketTypeExtraDialog {
  open: boolean;
  onClose(): void;
}
export default function TicketTypeExtraDialog(props: ITicketTypeExtraDialog) {
  const { open, onClose } = props;
  const currentDropzone = useCurrentDropzone();
  const state = useAppSelector(state => state.forms.extra);
  const dispatch = useAppDispatch();


  const [mutationCreateExtra, create] = useMutation<Mutation>(MUTATION_CREATE_EXTRA);
  const [mutationUpdateExtra, update] = useMutation<Mutation>(MUTATION_UPDATE_EXTRA);

  const validate = React.useCallback((): boolean => {
    let hasError = false;
    if (state.fields.name.value.length < 3) {
      hasError = true;
      dispatch(
        actions.forms.extra.setFieldError(["name", "Name is too short"])
      );
    }

    if (Number(state.fields.cost.value) < 0) {
      hasError = true;
      dispatch(
        actions.forms.extra.setFieldError(["cost", "Price must be a number"])
      );
    }


    return !hasError;
  }, [JSON.stringify(state.fields), dispatch]);

  const onSave = React.useCallback(async () => {
    const { name, cost, ticketTypeIds } = state.fields;

    if (validate()) {

      const mutation = state?.original?.id
       ? mutationUpdateExtra
       : mutationCreateExtra;

      try {
        const result = await mutation({
          variables: {
            ...state.original?.id ? { id: Number(state.original.id) } : {},
            dropzoneId: Number(currentDropzone?.dropzone?.id),
            name: name.value,
            cost: cost.value,
            ticketTypeIds: ticketTypeIds.value,
          }
        });

        const payload = state.original?.id
          ? result.data?.updateExtra
          : result.data?.createExtra;

        if (payload?.errors?.length) {
          return dispatch(
            actions.notifications.showSnackbar({ message: payload.errors[0], variant: "error" })
          )
        } else if (payload?.fieldErrors?.length) {
          payload.fieldErrors?.forEach(({ field, message }) => {
            switch(field) {
              case "name":
                return dispatch(actions.forms.extra.setFieldError(["name", message]));
              case "cost":
                return dispatch(actions.forms.extra.setFieldError(["cost", message]));
              case "ticket_type_ids":
                return dispatch(actions.forms.extra.setFieldError(["ticketTypeIds", message]));
            }
          });
        } else if (payload?.extra) {
          dispatch(
            actions.notifications.showSnackbar({ message: `Saved ${payload.extra.name}`, variant: "success" })
          );
          onClose();
          dispatch(actions.forms.extra.reset());
        }
      } catch (error) {
        dispatch(
          actions.notifications.showSnackbar({ message: error.message, variant: "error" })
        );
      }
    }
    
  }, [JSON.stringify(state.fields), dispatch, mutationCreateExtra]);

  return (
    <DialogOrSheet
      title={ state.original?.id ? "Edit ticket addon" : "New ticket addon"}
      open={open}
      onClose={onClose}
      loading={create.loading || update.loading}
      buttonAction={onSave}
      buttonLabel="Save"
      snapPoints={[0, "50%", "80%"]}
    >
      <ExtraForm />
    </DialogOrSheet>
  );
}
