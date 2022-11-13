import * as React from 'react';
import { useForm } from 'react-hook-form';
import { DropzoneUserDetailsFragment, OrderEssentialsFragment } from 'app/api/operations';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useManifestContext } from 'app/providers';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { isEqual } from 'lodash';
import { TransactionType } from 'app/api/schema.d';
import { useUserProfile } from 'app/api/crud';
import { useNotifications } from 'app/providers/notifications';

export type CreditFields = {
  amount: number;
  dropzoneUser: DropzoneUserDetailsFragment | null;
  type: TransactionType;
  message?: string | null;
};

export const orderValidation = yup.object({
  amount: yup.number().integer().default(0).min(1, 'Amount must be greater than 0'),
  message: yup.string().nullable().default(null),
  type: yup
    .string()
    .oneOf(Object.values(TransactionType))
    .required('No transaction type selected')
    .default(TransactionType.Withdrawal),
});

export const EMPTY_FORM_VALUES: Partial<CreditFields> = {
  amount: 0,
  message: null,
  dropzoneUser: null,
  type: TransactionType.Deposit,
};

export interface IUseManifestFormOpts {
  initial?: Partial<CreditFields>;
  dropzoneUser?: DropzoneUserDetailsFragment | null;
  onSuccess?(order: OrderEssentialsFragment): void;
}

export default function useCreditsForm(opts: IUseManifestFormOpts) {
  const { initial, dropzoneUser, onSuccess } = opts;
  const initialValues = React.useMemo(() => ({ ...EMPTY_FORM_VALUES, ...initial }), [initial]);
  const [defaultValues, setDefaultValues] = React.useState(initialValues);
  const { addCredits, withdrawCredits } = useUserProfile();

  const methods = useForm<CreditFields>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(orderValidation),
    shouldUnregister: false,
  });
  React.useEffect(() => {
    if (!isEqual(defaultValues, initialValues)) {
      setDefaultValues(initialValues);
    }
  }, [defaultValues, initialValues]);

  const { reset } = methods;
  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const { handleSubmit, setError } = methods;
  const {
    manifest: { createLoad },
  } = useManifestContext();
  const notify = useNotifications();

  const [{ loading }, onCreateOrder] = useAsyncFn(
    async (fields: CreditFields) => {
      console.debug({ fields });
      if (!dropzoneUser) {
        setError('amount', { message: 'No user selected' });
        return;
      }
      try {
        const response =
          fields.type === TransactionType.Deposit
            ? await addCredits(dropzoneUser, {
                amount: fields.amount,
                message: fields.message,
              })
            : await withdrawCredits(dropzoneUser, {
                amount: fields.amount,
                message: fields.message,
              });

        if (response) {
          if ('fieldErrors' in response) {
            response.fieldErrors?.forEach(({ field, message }) => {
              switch (field) {
                case 'message':
                  setError('message', { message });
                  break;
                default:
                  setError('amount', { message });
                  break;
              }
            });
          }
          if ('order' in response && response.order) {
            onSuccess?.(response.order);
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          notify.error(error.message);
        }
      }
    },
    [createLoad, dropzoneUser, setError, notify, onSuccess, addCredits, withdrawCredits]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onCreateOrder), [handleSubmit, onCreateOrder]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
