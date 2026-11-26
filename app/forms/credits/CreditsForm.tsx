import * as React from 'react';
import { FormTextField } from 'app/components/input/text/TextField';
import { TransactionType } from 'app/api/schema.d';
import { Control, useWatch } from 'react-hook-form';
import { FormNumberField } from 'app/components/input/number_input';
import { MembershipDetailsFragment } from 'app/api/operations';
import { NumberFieldType } from '../../components/input/number_input/NumberField';
import { CreditFields } from './useForm';
import { formatCents, fromCents } from 'app/utils/money';
import { useTranslation } from 'react-i18next';
import { Card, Divider, ListRow, Stack, Text } from 'app/ui';

interface ICreditsFormProps {
  control: Control<CreditFields>;
  membership?: MembershipDetailsFragment;
}
export default function CreditsForm(props: ICreditsFormProps) {
  const { t } = useTranslation('common');
  const { control, membership } = props;
  const { amount = 0, type } = useWatch({ control });

  const subtotal =
    type === TransactionType.Deposit
      ? fromCents(membership?.creditsCents) + amount
      : fromCents(membership?.creditsCents) - amount;
  return (
    <Stack gap="md">
      <FormTextField {...{ control }} label={t('forms.credits.message')} name="message" />
      <FormNumberField
        variant={NumberFieldType.Cash}
        label={
          type === TransactionType.Withdrawal
            ? t('forms.credits.withdrawAmount')
            : t('forms.credits.addAmount')
        }
        name="amount"
        {...{ control }}
      />
      <Card padding="none">
        <ListRow
          title={t('forms.credits.currentBalance')}
          trailing={<Text>{formatCents(membership?.creditsCents)}</Text>}
        />
        <Divider />
        <ListRow
          title={
            type === TransactionType.Withdrawal
              ? t('forms.credits.withdraw')
              : t('forms.credits.depositLabel')
          }
          trailing={
            <Text>{[type === TransactionType.Deposit ? '+' : '-', '$', amount].join('')}</Text>
          }
        />
        <Divider />
        <ListRow
          title={t('forms.credits.newTotal')}
          trailing={
            <Text>
              {[subtotal < 0 ? '-' : '', '$', subtotal < 0 ? subtotal * -1 : subtotal].join('')}
            </Text>
          }
        />
      </Card>
    </Stack>
  );
}
