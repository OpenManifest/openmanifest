import checkPasswordComplexity, { PasswordStrength } from 'app/utils/checkPasswordComplexity';
import * as yup from 'yup';


export const password = yup
  .string()
  .required('Password is required')
  .test({
    test: (value) => checkPasswordComplexity(value || '') >= PasswordStrength.Acceptable,
    message: 'Password is too weak',
    name: 'password-complexity'
  });
export const passwordConfirmation = yup
  .string()
  .default('')
  .when('password', {
    is: (password: number) => !!password,
    then: yup
      .string()
      .required('Password confirmation is required')
      .oneOf([yup.ref('password'), null], 'Passwords must match')
  });

export const fullName = yup
  .string()
  .required('Please enter your full name, including surname')
  .test({
    name: 'fullName',
    test: (value) => {
      console.debug('VALIDATING NAME', value);
      return /\w+\s\w+/.test(value || '');
    },
    message: 'Please enter your full name, including surname'
  });

export const email = yup.string().min(3).email('Please enter a valid email');
