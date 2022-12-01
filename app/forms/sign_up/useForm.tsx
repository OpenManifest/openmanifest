import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import checkPasswordComplexity, { PasswordStrength } from 'app/utils/checkPasswordComplexity';
import { useNotifications } from 'app/providers/notifications';
import { useUserSignUpMutation } from 'app/api/reflection';
import { useAppSelector } from 'app/state';

export interface SignUpFields {
  email: string;
  name: string;
  password: string;
  passwordConfirmation: string;
}

export const signUpValidation = yup.object().shape({
  name: yup.string().default(''),
  email: yup.string().required('Email is required').email('This is not a valid email'),
  password: yup
    .string()
    .required('Password is required')
    .test({
      test: (value) => checkPasswordComplexity(value || '') >= PasswordStrength.Acceptable,
      message: 'Password is too weak',
      name: 'password-complexity',
    }),
  passwordConfirmation: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please type the password again'),
});

export const EMPTY_FORM_VALUES: SignUpFields = {
  name: '',
  email: '',
  password: '',
  passwordConfirmation: '',
};

export interface ISignUpFormOpts {
  initial?: Partial<SignUpFields>;
  onSuccess?(): void;
}

enum SignUpSteps {
  Email,
  Password,
  PasswordConfirmation,
}

export default function useSignupForm(opts: ISignUpFormOpts) {
  const { onSuccess } = opts;
  const [loading, setLoading] = React.useState(false);
  const globalState = useAppSelector((root) => root.global);

  const [step, setStep] = React.useState(SignUpSteps.Email);

  const notify = useNotifications();
  const methods = useForm<SignUpFields>({
    defaultValues: EMPTY_FORM_VALUES,
    mode: 'all',
  });

  React.useEffect(() => {
    methods.reset(EMPTY_FORM_VALUES);
  }, [methods]);
  const { setError } = methods;

  const [onSignUp] = useUserSignUpMutation();

  const onSubmit = React.useCallback(
    async (fields: SignUpFields) => {
      try {
        const { data } = await onSignUp({
          variables: {
            pushToken: globalState.expoPushToken,
            email: fields.email,
            name: fields.name,
            password: fields.password,
            exitWeight: 60,
            phone: '',
            passwordConfirmation: fields.passwordConfirmation,
          },
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
    [onSignUp, globalState.expoPushToken, setError, onSuccess, notify]
  );

  const onNext = React.useCallback(
    async function FormNext() {
      try {
        setLoading(true);
        const validated = await signUpValidation.validate(methods.getValues(), {
          abortEarly: false,
        });
        console.debug({ validated });

        if (step === SignUpSteps.PasswordConfirmation) {
          await onSubmit(validated);
        }
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          console.debug({ inner: error.inner });
          error.inner.forEach((validationError) => {
            switch (step) {
              case SignUpSteps.Email:
                if (validationError.path === 'email') {
                  setError('email', { message: validationError.message });
                  throw error;
                }
                break;
              case SignUpSteps.Password:
                if (validationError.path === 'password') {
                  setError('password', { message: validationError.message });
                  throw error;
                }
                break;
              case SignUpSteps.PasswordConfirmation:
                if (validationError.path === 'passwordConfirmation') {
                  setError('passwordConfirmation', { message: validationError.message });
                  throw error;
                }
                break;
              default:
                break;
            }
          });
          setStep(step + 1);
        } else {
          throw error;
        }
      } finally {
        setLoading(false);
      }
    },
    [methods, onSubmit, setError, step]
  );

  return React.useMemo(() => ({ ...methods, onNext, loading }), [methods, onNext, loading]);
}
