import { MutationFunctionOptions, MutationResult } from '@apollo/client';
import { LoginWithAppleMutation, LoginWithAppleMutationVariables } from 'app/api/operations';
import { useLoginWithAppleMutation } from 'app/api/reflection';
import { useNotifications } from 'app/providers/notifications';
import { useSession } from 'app/state';
import {
  AppleAuthenticationButton,
  AppleAuthenticationButtonProps,
  AppleAuthenticationButtonStyle,
  AppleAuthenticationButtonType,
  AppleAuthenticationScope,
  signInAsync,
} from 'expo-apple-authentication';
import * as React from 'react';
import { useTheme } from 'app/ui';

export function useLoginWithApple(
  opts?: MutationFunctionOptions<LoginWithAppleMutation, LoginWithAppleMutationVariables>
) {
  const expoPushToken = useSession((session) => session.expoPushToken);
  const setCredentials = useSession((session) => session.setCredentials);
  const [onLoginWithApple, mutation] = useLoginWithAppleMutation(opts);
  const notify = useNotifications();

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
          setCredentials(data.loginWithApple.credentials);
        }
      }
    } catch (e) {
      if (e instanceof Error) {
        notify.error(e.message);
      }
    }
  }, [expoPushToken, notify, onLoginWithApple, setCredentials]);
  return [onLogin, mutation] as [() => Promise<void>, MutationResult<LoginWithAppleMutation>];
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
        theme.isDark
          ? AppleAuthenticationButtonStyle.WHITE_OUTLINE
          : AppleAuthenticationButtonStyle.BLACK
      }
      cornerRadius={theme.radius.md}
      style={{
        width: '100%',
        height: Math.max(theme.density.row, theme.density.touchTarget),
        ...(props.style as object),
      }}
    />
  );
}
