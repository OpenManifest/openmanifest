import * as React from "react";
import UserForm from '../forms/user/UserForm';
import { actions, useAppDispatch, useAppSelector } from "../../state";
import DialogOrSheet from "../layout/DialogOrSheet";
import useMutationUpdateUser from "../../api/hooks/useMutationUpdateUser";

interface IUpdateUserDialog {
  open?: boolean;
  onClose(): void;
  onSuccess(): void;
}
export default function UpdateUserDialog(props: IUpdateUserDialog) {
  const { open, onSuccess } = props;
  const state = useAppSelector(state => state.forms.user);
  const dispatch = useAppDispatch();


  const mutationUpdateUser = useMutationUpdateUser({
    onSuccess: (payload) => {
      dispatch(
        actions.notifications.showSnackbar({ message: `Profile has been updated`, variant: "success" })
      );
      dispatch(actions.forms.user.reset());
      onSuccess();
    },
    onFieldError: (field, value) =>
      dispatch(actions.forms.user.setFieldError([field as any, value])),
    onError: (error) =>
      dispatch(actions.notifications.showSnackbar({ message: error, variant: "error" })),
  });

  const validate = React.useCallback((): boolean => {
    let hasError = false;
    const emailRegex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    if ((state.fields.name?.value?.length || 0) < 3) {
      hasError = true;
      dispatch(
        actions.forms.user.setFieldError(["name", "Name is too short"])
      );
    }

    if ((state.fields.email?.value?.length || 0) < 3) {
      hasError = true;
      dispatch(
        actions.forms.user.setFieldError(["email", "Email is too short"])
      );
    }

    if ((state.fields.phone?.value?.length || 0) < 3) {
      hasError = true;
      dispatch(
        actions.forms.user.setFieldError(["phone", "Phone number is too short"])
      );
    }

    if (!emailRegex.test(state.fields?.email?.value || "")) {
      hasError = true;
      dispatch(
        actions.forms.user.setFieldError(["email", "Please enter a valid email"])
      );
    }

    if ((state.fields.exitWeight?.value || 0) < 30) {
      hasError = true;
      dispatch(
        actions.forms.user.setFieldError(["exitWeight", "Exit weight seems too low?"])
      );
    }

    return !hasError;
  }, [JSON.stringify(state.fields), dispatch]);

  const onSave = React.useCallback(async () => {
    const { name, license, phone, email, exitWeight } = state.fields;

    

    if (validate()) {
      try {
        const result = await mutationUpdateUser.mutate({
          id: Number(state.original!.id!),
          name: name.value,
          licenseId: !license.value?.id ? null : Number(license.value!.id),
          phone: phone.value,
          exitWeight: parseFloat(exitWeight.value!),
          email: email.value,
        });        
      } catch (error) {
        dispatch(
          actions.notifications.showSnackbar({ message: error.message, variant: "error" })
        );
      }
    }
    
  }, [JSON.stringify(state.fields), dispatch, mutationUpdateUser]);


  return (
    <DialogOrSheet
      title="Update information"
      open={open}
      snapPoints={[0, 740]}
      loading={mutationUpdateUser.loading}
      onClose={() => {
        props.onClose();
        dispatch(actions.forms.user.reset());
      }}
      buttonAction={onSave}
      buttonLabel="Save"
    >
      <UserForm />
    </DialogOrSheet>
  )
}
