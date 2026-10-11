import { createFieldsContext } from '../fields';

export const [RecoverPasswordFieldsProvider, useRecoverPasswordFields] =
  createFieldsContext<'email'>('Recover password');
