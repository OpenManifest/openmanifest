import { Mutation } from '../schema.d';

interface ErrorHandlerOpts<T extends Partial<IGenericFieldErrorResponse>> {
  onSuccess?(payload: T): void;
  onFieldError?(field: string, message: string): void;
  onError?(message: string): void;
}

type MutationsWithoutDevise = Omit<
  Mutation,
  | '__typename'
  | 'userConfirmRegistrationWithToken'
  | 'userLogin'
  | 'userLogout'
  | 'userRegister'
  | 'userResendConfirmation'
  | 'userResendConfirmationWithToken'
  | 'userSendPasswordReset'
  | 'userSendPasswordResetWithToken'
  | 'userSignUp'
  | 'userUpdatePassword'
  | 'userUpdatePasswordWithToken'
>;

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};
type IGenericFieldErrorResponse = {
  [K in keyof MutationsWithoutDevise]: RecursivePartial<MutationsWithoutDevise[K]>;
};

export default function mutationHandlers<T extends Partial<IGenericFieldErrorResponse>>(
  opts: ErrorHandlerOpts<T>
) {
  const { onError, onFieldError, onSuccess } = opts;
  return {
    onCompleted: (payload: T) => {
      const [entry] = Object.values(payload);
      if (entry?.errors?.length) {
        entry?.errors?.filter(Boolean).forEach((message) => onError?.(message as string));
      }
      if (entry?.fieldErrors?.length) {
        entry?.fieldErrors?.forEach((err) =>
          onFieldError?.(err?.field as string, err?.message as string)
        );
      }

      if (!entry?.fieldErrors?.length && !entry?.errors?.length) {
        onSuccess?.(payload);
      }
    },
  };
}
