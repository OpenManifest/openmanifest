import { MutationFunctionOptions, MutationResult } from '@apollo/client';
import {
  LoginWithAppleMutation,
  LoginWithAppleMutationVariables,
  LoginWithFacebookMutation,
} from 'app/api/operations';
import * as React from 'react';
import { View } from 'react-native';

export function useLoginWithApple(
  opts?: MutationFunctionOptions<LoginWithAppleMutation, LoginWithAppleMutationVariables>
) {
  return [() => null, null] as unknown as [
    () => Promise<void>,
    MutationResult<LoginWithFacebookMutation>
  ];
}

export default function AppleButton() {
  return <View />;
}
