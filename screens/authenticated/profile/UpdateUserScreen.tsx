import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { gql, useMutation } from "@apollo/client";
import { useAppSelector, useAppDispatch, dropzoneForm, userForm } from '../../../redux';

import { View } from '../../../components/Themed';
import { actions as snackbar } from "../../../components/notifications";
import globalSlice from "../../../redux/global";

import slice from "../../../components/forms/user/slice";
import { Mutation, User } from '../../../graphql/schema';
import UserForm from '../../../components/forms/user/UserForm';
import { useNavigation, useRoute } from '@react-navigation/core';

const { actions } = slice;
const { actions: globalActions } = globalSlice;


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

export default function UpdateUserScreen() {
  const { userForm: state, global: globalState } = useAppSelector(state => state);
  const dispatch = useAppDispatch();

  const navigation = useNavigation();
  const route = useRoute<{ key: string, name: string, params: { user: User }}>();
  const user = route.params!.user;

  React.useEffect(() => {
    dispatch(actions.setOriginal(user));
  }, [user?.id]);

  const [mutationUpdateUser, data] = useMutation<Mutation>(MUTATION_CREATE_USER);

  const validate = React.useCallback((): boolean => {
    let hasError = false;
    const emailRegex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    if ((state.fields.name?.value?.length || 0) < 3) {
      hasError = true;
      dispatch(
        actions.setFieldError(["name", "Name is too short"])
      );
    }

    if ((state.fields.email?.value?.length || 0) < 3) {
      hasError = true;
      dispatch(
        actions.setFieldError(["email", "Email is too short"])
      );
    }

    if ((state.fields.phone?.value?.length || 0) < 3) {
      hasError = true;
      dispatch(
        actions.setFieldError(["phone", "Phone number is too short"])
      );
    }

    if (!emailRegex.test(state.fields?.email?.value || "")) {
      hasError = true;
      dispatch(
        actions.setFieldError(["email", "Please enter a valid email"])
      );
    }

    if ((state.fields.exitWeight?.value || 0) < 30) {
      hasError = true;
      dispatch(
        actions.setFieldError(["exitWeight", "Exit weight seems too low?"])
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
                  return dispatch(userForm.setFieldError(["name", message]));
                case "exit_weight":
                  return dispatch(userForm.setFieldError(["exitWeight", message]));
                case "license_id":
                  return dispatch(userForm.setFieldError(["license", message]));
                case "phone":
                  return dispatch(userForm.setFieldError(["phone", message]));
                case "email":
                  return dispatch(userForm.setFieldError(["email", message]));
              }
            });
          } else if (errors?.length) {
            errors.map((message) =>
              dispatch(
                snackbar.showSnackbar({ message: message, variant: "error" })
              )
            );
          } else {
            dispatch(
              snackbar.showSnackbar({ message: `Profile has been updated`, variant: "success" })
            );
            navigation.goBack();
            dispatch(userForm.reset());
          }

        }
      } catch (error) {
        dispatch(
          snackbar.showSnackbar({ message: error.message, variant: "error" })
        );
      }
    }
    
  }, [JSON.stringify(state.fields), dispatch, mutationUpdateUser]);

  return (
    <View style={styles.container}>
        <UserForm />
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
    paddingTop: 56,
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
