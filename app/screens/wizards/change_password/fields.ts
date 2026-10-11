import { createFieldsContext } from '../fields';

export const [ChangePasswordFieldsProvider, useChangePasswordFields] = createFieldsContext<
  'password' | 'passwordConfirmation'
>('Change password');
