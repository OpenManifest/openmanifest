import { MutationFunctionOptions, MutationResult } from '@apollo/client';
import {
  LoginWithAppleMutation,
  LoginWithAppleMutationVariables,
  LoginWithFacebookMutation,
} from 'app/api/operations';
import { useLoginWithAppleMutation } from 'app/api/reflection';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import {
  AppleAuthenticationButton,
  AppleAuthenticationButtonProps,
  AppleAuthenticationButtonStyle,
  AppleAuthenticationButtonType,
  AppleAuthenticationScope,
  signInAsync,
} from 'expo-apple-authentication';
import * as React from 'react';
import { useTheme } from 'react-native-paper';

export function useLoginWithApple(
  opts?: MutationFunctionOptions<LoginWithAppleMutation, LoginWithAppleMutationVariables>
) {
  const { expoPushToken } = useAppSelector((root) => root.global);
  const [onLoginWithApple, mutation] = useLoginWithAppleMutation(opts);
  const dispatch = useAppDispatch();

  const onLogin = React.useCallback(async () => {
    try {
      const credential = await signInAsync({
        requestedScopes: [AppleAuthenticationScope.FULL_NAME, AppleAuthenticationScope.EMAIL],
      });

      if (credential.authorizationCode && credential.identityToken) {
        const { identityToken: token, user: userIdentity } = credential;
        const { data } = await onLoginWithApple({
          variables: {
            pushToken: expoPushToken || null,
            token,
            userIdentity,
          },
        });
        if (data?.loginWithApple?.authenticatable && data?.loginWithApple?.credentials) {
          dispatch(actions.global.setCredentials(data.loginWithApple.credentials));
          dispatch(actions.global.setUser(data.loginWithApple.authenticatable));
        }
      }
    } catch (e) {
      if (e instanceof Error) {
        console.log(e);
        dispatch(
          actions.notifications.showSnackbar({
            message: e.message,
            variant: 'error',
          })
        );
      }
    }
  }, [dispatch, expoPushToken, onLoginWithApple]);
  return [onLogin, mutation] as [() => Promise<void>, MutationResult<LoginWithFacebookMutation>];
}

export default function AppleButton(
  props: Omit<AppleAuthenticationButtonProps, 'buttonType' | 'buttonStyle' | 'cornerRadius'> &
    Partial<Pick<AppleAuthenticationButtonProps, 'buttonType' | 'buttonStyle' | 'cornerRadius'>>
) {
  const theme = useTheme();
  return (
    <AppleAuthenticationButton
      {...props}
      buttonType={AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={
        theme.dark
          ? AppleAuthenticationButtonStyle.WHITE_OUTLINE
          : AppleAuthenticationButtonStyle.BLACK
      }
      cornerRadius={4}
      style={{ width: '100%', height: 36, borderRadius: 30, marginVertical: 8 }}
    />
  );
}
