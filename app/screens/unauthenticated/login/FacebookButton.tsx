import * as React from 'react';
import * as Facebook from 'expo-facebook';
import { Button } from 'react-native-paper';
import { FacebookAuthenticationCredential } from 'expo-facebook';
import { useLoginWithFacebookMutation } from 'app/api/reflection';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { MutationFunctionOptions, MutationResult } from '@apollo/client';
import { LoginWithFacebookMutation, LoginWithFacebookMutationVariables } from 'app/api/operations';

type Extract<T> = T extends React.ComponentType<infer P> ? P : never;

export function useLoginWithFacebook(
  opts?: MutationFunctionOptions<LoginWithFacebookMutation, LoginWithFacebookMutationVariables>
) {
  const { expoPushToken } = useAppSelector((root) => root.global);
  const [onLoginWithFacebook, mutation] = useLoginWithFacebookMutation(opts);
  const dispatch = useAppDispatch();

  const onLogin = React.useCallback(async () => {
    try {
      await Facebook.initializeAsync({
        appId: '686479516065674',
      });
      const { type, token, ...rest } = (await Facebook.logInWithReadPermissionsAsync({
        permissions: ['public_profile', 'email'],
      })) as FacebookAuthenticationCredential & { type: 'success' };

      if (type === 'success') {
        // Get the user's name using Facebook's Graph API
        const response = await fetch(
          `https://graph.facebook.com/me?access_token=${token}&fields=email,name,picture`
        );
        const json = await response.json();

        const { data } = await onLoginWithFacebook({
          variables: {
            pushToken: expoPushToken || null,
            token,
          },
        });
        if (data?.loginWithFacebook?.authenticatable && data?.loginWithFacebook?.credentials) {
          dispatch(actions.global.setCredentials(data.loginWithFacebook.credentials));
          dispatch(actions.global.setUser(data.loginWithFacebook.authenticatable));
        }
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        dispatch(
          actions.notifications.showSnackbar({
            message: e.message,
            variant: 'error',
          })
        );
      }
    }
  }, [dispatch, expoPushToken, onLoginWithFacebook]);
  return [onLogin, mutation] as [() => Promise<void>, MutationResult<LoginWithFacebookMutation>];
}
export default function FacebookButton(
  props: Omit<Extract<typeof Button>, 'mode' | 'color' | 'icon' | 'children'> &
    Partial<Pick<Extract<typeof Button>, 'mode' | 'color' | 'icon'>>
) {
  return (
    <Button
      icon="facebook"
      mode="contained"
      color="#3b5998"
      labelStyle={{ fontSize: 11 }}
      {...props}
    >
      Login with Facebook
    </Button>
  );
}
