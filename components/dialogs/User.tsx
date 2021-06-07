import { gql, useMutation } from "@apollo/client";
import * as React from "react";
import { Mutation } from "../../graphql/schema";
import UserForm from '../forms/user/UserForm';
import { actions, useAppDispatch, useAppSelector } from "../../redux";
import DialogOrSheet from "../layout/DialogOrSheet";

interface IUpdateUserDialog {
  open?: boolean;
  onClose(): void;
  onSuccess(): void;
}
const MUTATION_CREATE_USER = gql`
  mutation UpdateUser(
    $id: Int,
    $name: String,
    $phone: String,
    $email: String,
    $licenseId: Int,
    $exitWeight: Float,
  ){
    updateUser(input: {
      id: $id
      attributes: {
        name: $name,
        phone: $phone,
        email: $email,
        licenseId: $licenseId,
        exitWeight: $exitWeight,
      }
    }) {
      user {
        id
        name
        exitWeight
        email
        phone
        rigs {
          id
          model
          make
          serial
          canopySize
        }
        jumpTypes {
          id
          name
        }
        license {
          id
          name

          federation {
            id
            name
          }
        }
      }
    }
  }
`;

export default function UpdateUserDialog(props: IUpdateUserDialog) {
  const { open, onSuccess } = props;
  const state = useAppSelector(state => state.forms.user);
  const dispatch = useAppDispatch();


  const [mutationUpdateUser, mutation] = useMutation<Mutation>(MUTATION_CREATE_USER);

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
        const result = await mutationUpdateUser({
          variables: {
            id: Number(state.original!.id!),
            name: name.value,
            licenseId: !license.value?.id ? null : Number(license.value!.id),
            phone: phone.value,
            exitWeight: parseFloat(exitWeight.value!),
            email: email.value,
          }
        });
        
        if (result.data?.updateUser?.user) {
          const { fieldErrors, errors } = result.data.updateUser;

          if (fieldErrors) {
            fieldErrors?.map(({ field, message }) => {
              switch (field) {
                case "name":
                  return dispatch(actions.forms.user.setFieldError(["name", message]));
                case "exit_weight":
                  return dispatch(actions.forms.user.setFieldError(["exitWeight", message]));
                case "license_id":
                  return dispatch(actions.forms.user.setFieldError(["license", message]));
                case "phone":
                  return dispatch(actions.forms.user.setFieldError(["phone", message]));
                case "email":
                  return dispatch(actions.forms.user.setFieldError(["email", message]));
              }
            });
          } else if (errors?.length) {
            errors.map((message) =>
              dispatch(
                actions.notifications.showSnackbar({ message: message, variant: "error" })
              )
            );
          } else {
            dispatch(
              actions.notifications.showSnackbar({ message: `Profile has been updated`, variant: "success" })
            );
            dispatch(actions.forms.user.reset());
            onSuccess();
          }

        }
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
      snapPoints={[740, 0]}
      loading={mutation.loading}
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
