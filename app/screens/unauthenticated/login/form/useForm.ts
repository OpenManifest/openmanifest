import { yupResolver } from '@hookform/resolvers/yup';
import { useLoginMutation } from 'app/api/reflection';
import { useNotifications } from 'app/providers/notifications';
import { actions, useAppDispatch } from 'app/state';
import React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useLoginWithApple } from './AppleButton';
import { useLoginWithFacebook } from './FacebookButton';

export interface LoginFields {
  email: string;
  password: string;
}

export const validate = yup.object({
  email: yup.string().required('Email is required').email('This is not a valid email'),
  password: yup.string().required('Password is required'),
});

const EMPTY_FORM_VALUES: LoginFields = {
  email: '',
  password: '',
};

export default function useLoginForm() {
  const dispatch = useAppDispatch();
  const methods = useForm({
    defaultValues: EMPTY_FORM_VALUES,
    mode: 'all',
    resolver: yupResolver(validate),
  });
  const { handleSubmit } = methods;
  const [loading, setLoading] = React.useState(false);
  const [mutationLogin, data] = useLoginMutation();
  const [loginWithFacebook, loginWithFacebookMutation] = useLoginWithFacebook();
  const [loginWithApple, loginWithAppleMutation] = useLoginWithApple();

  const notify = useNotifications();

  const onLogin = React.useCallback(
    async function Login(variables: LoginFields) {
      try {
        const result = await mutationLogin({
          variables,
        });

        if (result?.data?.userLogin?.authenticatable && result?.data?.userLogin?.credentials) {
          dispatch(actions.global.setCredentials(result.data.userLogin.credentials));
          dispatch(actions.global.setUser(result.data.userLogin.authenticatable));
        }
      } catch (e) {
        if (e instanceof Error) {
          notify.error(e.message);
        }
      }
    },
    [dispatch, mutationLogin, notify]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onLogin), [handleSubmit, onLogin]);

  return React.useMemo(
    () => ({
      ...methods,
      onSubmit,
      loginWithFacebook,
      loginWithApple,
      loading:
        loginWithFacebookMutation?.loading || data?.loading || loginWithAppleMutation?.loading,
    }),
    [
      data?.loading,
      loginWithApple,
      loginWithAppleMutation?.loading,
      loginWithFacebook,
      loginWithFacebookMutation?.loading,
      methods,
      onSubmit,
    ]
  );
}
