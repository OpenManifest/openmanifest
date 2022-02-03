import * as React from 'react';
import { useLoginWithFacebookMutation } from 'app/api/reflection';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { MutationFunctionOptions, MutationResult } from '@apollo/client';
import { LoginWithFacebookMutation, LoginWithFacebookMutationVariables } from 'app/api/operations';
import Button, { ReactFacebookFailureResponse, ReactFacebookLoginInfo } from 'react-facebook-login';
import { StyleSheet, View } from 'react-native';

type Extract<T> = T extends React.ComponentType<infer P> ? P : never;

export function useLoginWithFacebook(
  opts?: MutationFunctionOptions<LoginWithFacebookMutation, LoginWithFacebookMutationVariables>
) {
  const { expoPushToken } = useAppSelector((root) => root.global);
  const [onLoginWithFacebook, mutation] = useLoginWithFacebookMutation(opts);
  const dispatch = useAppDispatch();

  const onLogin = React.useCallback(
    async (response: ReactFacebookLoginInfo | ReactFacebookFailureResponse) => {
      try {
        if ('accessToken' in response) {
          const { data } = await onLoginWithFacebook({
            variables: {
              pushToken: expoPushToken || null,
              token: response.accessToken,
            },
          });
          console.log(data);
          if (data?.loginWithFacebook?.authenticatable && data?.loginWithFacebook?.credentials) {
            dispatch(actions.global.setCredentials(data.loginWithFacebook.credentials));
            dispatch(actions.global.setUser(data.loginWithFacebook.authenticatable));
          }
        }
      } catch (e) {
        if (e instanceof Error) {
          dispatch(
            actions.notifications.showSnackbar({
              message: e.message,
              variant: 'error',
            })
          );
        }
      }
    },
    [dispatch, expoPushToken, onLoginWithFacebook]
  );
  return [onLogin, mutation] as [() => Promise<void>, MutationResult<LoginWithFacebookMutation>];
}
export default function FacebookButton(
  props: Omit<Extract<typeof Button>, 'appId' | 'reAuthenticate' | 'fields' | 'children'> &
    Partial<Pick<Extract<typeof Button>, 'appId' | 'reAuthenticate' | 'fields'>> & {
      onPress: Extract<typeof Button>['callback'];
    }
) {
  const dispatch = useAppDispatch();
  const { onPress } = props;
  return (
    <View style={{ height: 100 }}>
      <Button
        appId="686479516065674"
        reAuthenticate
        buttonStyle={styles.webButton}
        autoLoad
        fields="email,name,picture"
        // buttonStyle={{ height: 100 }}
        onFailure={() => {
          dispatch(
            actions.notifications.showSnackbar({
              message: 'Facebook authentication failed',
              variant: 'error',
            })
          );
        }}
        {...props}
        callback={onPress}
      >
        Login with Facebook
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  webButton: {
    height: 25,
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderRadius: 4,
    marginTop: 16,
  },
});
