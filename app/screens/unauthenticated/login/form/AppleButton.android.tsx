import { MutationFunctionOptions, MutationResult } from '@apollo/client';
import { LoginWithAppleMutation, LoginWithAppleMutationVariables } from 'app/api/operations';

export function useLoginWithApple(
  opts?: MutationFunctionOptions<LoginWithAppleMutation, LoginWithAppleMutationVariables>
) {
  return [() => null, null] as unknown as [
    () => Promise<void>,
    MutationResult<LoginWithAppleMutation>,
  ];
}

/** Sign in with Apple is offered on iOS only */
export default function AppleButton(_props: { onPress?(): void }) {
  return null;
}
