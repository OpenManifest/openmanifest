import * as React from "react";
import GhostForm from '../forms/ghost/GhostForm';
import { actions, useAppDispatch, useAppSelector } from "../../state";
import DialogOrSheet from "../layout/DialogOrSheet";
import useMutationCreateGhost from "../../api/hooks/useMutationCreateGhost";

interface ICreateGhostDialog {
  open?: boolean;
  onClose(): void;
  onSuccess(): void;
}
export default function CreateGhostDialog(props: ICreateGhostDialog) {
  const { open, onSuccess } = props;
  const state = useAppSelector(state => state.forms.ghost);
  const globalState = useAppSelector(state => state.global);
  const dispatch = useAppDispatch();


  const mutationCreateGhost = useMutationCreateGhost({
    onSuccess: (payload) => {
      
    },
    onFieldError: (field, value) => {
      dispatch(actions.forms.ghost.setFieldError([field as any, value]));
      console.log(field, value);
    },
      
    onError: (error) =>
      dispatch(actions.notifications.showSnackbar({ message: error, variant: "error" })),
  });

  const onSave = React.useCallback(async () => {
    const { name, license, phone, email, exitWeight, role } = state.fields;
    try {
      const result = await mutationCreateGhost.mutate({
        dropzoneId: globalState.currentDropzoneId,
        name: name.value,
        licenseId: !license.value?.id ? null : Number(license.value!.id),
        phone: phone.value,
        exitWeight: Number(exitWeight.value),
        email: email.value,
        roleId: Number(role.value.id),
      });

      onSuccess();
      dispatch(
        actions.notifications.showSnackbar({ message: `Profile has been updated`, variant: "success" })
      );
      dispatch(actions.forms.ghost.reset());
    } catch (error) {
      dispatch(
        actions.notifications.showSnackbar({ message: error.message, variant: "error" })
      );
    }
    
  }, [JSON.stringify(state.fields), dispatch, mutationCreateGhost, open, onSuccess]);


  return (
    <DialogOrSheet
      title="Pre-register user"
      open={open}
      snapPoints={[0, 400, 740]}
      loading={mutationCreateGhost.loading}
      onClose={() => {
        props.onClose();
      }}
      buttonAction={onSave}
      buttonLabel="Save"
    >
      <GhostForm />
    </DialogOrSheet>
  )
}
