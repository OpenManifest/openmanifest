import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import checkPasswordComplexity, { PasswordStrength } from 'app/utils/checkPasswordComplexity';
import { useNotifications } from 'app/providers/notifications';
import { useUserSignUpMutation } from 'app/api/reflection';
import { useAppSelector } from 'app/state';
import { yupResolver } from '@hookform/resolvers/yup';

export interface SignUpFields {
  step: number;
  email: string;
  name: string;
  password: string;
  passwordConfirmation: string;
}

export const signUpValidation = yup.object().shape({
  step: yup.number().default(0),
  name: yup.string().default(''),
  email: yup.string().when('step', {
    is: (step: number) => step >= 0,
    then: yup.string().required('Email is required').min(3).email('Please enter a valid email')
  }),
  password: yup
    .string()
    .default('')
    .when('step', {
      is: (step: number) => step >= 1,
      then: yup
        .string()
        .required('Password is required')
        .test({
          test: (value) => checkPasswordComplexity(value || '') >= PasswordStrength.Acceptable,
          message: 'Password is too weak',
          name: 'password-complexity'
        })
    }),
  passwordConfirmation: yup
    .string()
    .default('')
    .when('step', {
      is: (step: number) => step >= 2,
      then: yup
        .string()
        .required('Password confirmation is required')
        .oneOf([yup.ref('password'), null], 'Passwords must match')
    })
});

export const EMPTY_FORM_VALUES: SignUpFields = {
  step: 0,
  name: '',
  email: '',
  password: '',
  passwordConfirmation: ''
};

export interface ISignUpFormOpts {
  initial?: Partial<SignUpFields>;
  onSuccess?(): void;
}

enum SignUpSteps {
  Email = 0,
  Password = 1,
  PasswordConfirmation = 2
}

export default function useSignupForm(opts: ISignUpFormOpts) {
  const { onSuccess } = opts;
  const [loading, setLoading] = React.useState(false);
  const globalState = useAppSelector((root) => root.global);

  const notify = useNotifications();
  const methods = useForm<SignUpFields>({
    defaultValues: EMPTY_FORM_VALUES,
    mode: 'all',
    resolver: yupResolver(signUpValidation)
  });

  React.useEffect(() => {
    methods.reset(EMPTY_FORM_VALUES);
  }, [methods]);
  const { setError, setValue } = methods;

  const [onSignUp] = useUserSignUpMutation();

  const onSubmit = React.useCallback(
    async (fields: SignUpFields) => {
      try {
        if (fields.step !== SignUpSteps.PasswordConfirmation) return setValue('step', fields.step + 1);
        setLoading(true);
        const { data } = await onSignUp({
          variables: {
            pushToken: globalState.expoPushToken,
            email: fields.email,
            name: fields.name,
            password: fields.password,
            exitWeight: 60,
            phone: '',
            passwordConfirmation: fields.passwordConfirmation
          }
        });

        if (data?.userRegister?.fieldErrors) {
          data?.userRegister?.fieldErrors?.forEach(({ field, message }) => {
            setError(field as keyof SignUpFields, { type: 'custom', message });
          });
        }
        if (data?.userRegister?.authenticatable?.id) {
          onSuccess?.();
        }
      } catch (error) {
        if (error instanceof Error) {
          notify.error(error.message);
          throw new Error();
        }
      }
    },
    [setValue, onSignUp, globalState.expoPushToken, setError, onSuccess, notify]
  );

  return React.useMemo(
    () => ({ ...methods, onNext: methods.handleSubmit(onSubmit, () => Promise.reject()), loading }),
    [methods, onSubmit, loading]
  );
}
