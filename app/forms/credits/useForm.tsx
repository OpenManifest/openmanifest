import * as React from 'react';
import { useForm } from 'react-hook-form';
import { MembershipDetailsFragment, OrderEssentialsFragment } from 'app/api/operations';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useManifestContext } from 'app/providers/manifest/context';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { isEqual } from 'lodash';
import { TransactionType } from 'app/api/schema.d';
import { useUserProfile } from 'app/api/crud';
import { useNotifications } from 'app/providers/notifications';
import withDefaults from 'app/forms/initialValues';
import i18n from 'app/i18n';

export type CreditFields = {
  amount: number;
  membership: MembershipDetailsFragment | null;
  type: TransactionType;
  message?: string | null;
};

export const orderValidation = yup.object({
  amount: yup
    .number()
    .integer()
    .default(0)
    .min(1, () => i18n.t('forms.credits.amountMustBeGreaterThan0')),
  message: yup.string().nullable().default(null),
  type: yup
    .string()
    .oneOf(Object.values(TransactionType))
    .required(() => i18n.t('forms.credits.noTransactionTypeSelected'))
    .default(TransactionType.Withdrawal),
});

export const EMPTY_FORM_VALUES: Partial<CreditFields> = {
  amount: 0,
  message: null,
  membership: null,
  type: TransactionType.Deposit,
};

export interface IUseManifestFormOpts {
  initial?: Partial<CreditFields>;
  membership?: MembershipDetailsFragment | null;
  onSuccess?(order: OrderEssentialsFragment): void;
}

export default function useCreditsForm(opts: IUseManifestFormOpts) {
  const { initial, membership, onSuccess } = opts;
  const initialValues = React.useMemo(() => withDefaults(EMPTY_FORM_VALUES, initial), [initial]);
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
      if (!membership) {
        setError('amount', { message: i18n.t('forms.credits.noUserSelected') });
        return;
      }
      try {
        const response =
          fields.type === TransactionType.Deposit
            ? await addCredits(membership, {
                amount: fields.amount,
                message: fields.message,
              })
            : await withdrawCredits(membership, {
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
    [createLoad, membership, setError, notify, onSuccess, addCredits, withdrawCredits]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onCreateOrder), [handleSubmit, onCreateOrder]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
