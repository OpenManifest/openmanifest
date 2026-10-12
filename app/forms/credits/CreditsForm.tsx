import * as React from 'react';
import { Text, View } from 'react-native';
import { FormTextField } from 'app/components/input/text/TextField';
import { Divider, DataTable } from 'react-native-paper';
import { TransactionType } from 'app/api/schema.d';
import { Control, useWatch } from 'react-hook-form';
import { FormNumberField } from 'app/components/input/number_input';
import { MembershipDetailsFragment } from 'app/api/operations';
import { NumberFieldType } from '../../components/input/number_input/NumberField';
import { CreditFields } from './useForm';
import { formatCents, fromCents } from 'app/utils/money';

interface ICreditsFormProps {
  control: Control<CreditFields>;
  membership?: MembershipDetailsFragment;
}
export default function CreditsForm(props: ICreditsFormProps) {
  const { control, membership } = props;
  const { amount = 0, type } = useWatch({ control });

  const subtotal =
    type === TransactionType.Deposit
      ? fromCents(membership?.creditsCents) + amount
      : fromCents(membership?.creditsCents) - amount;
  return (
    <>
      <FormTextField
        {...{ control }}
        label="Message"
        name="message"
        // style={{ marginHorizontal: 8 }}
      />
      <View>
        <FormNumberField
          variant={NumberFieldType.Cash}
          label={type === TransactionType.Withdrawal ? 'Withdraw amount' : 'Add amount'}
          name="amount"
          {...{ control }}
        />
        <Divider />

        <DataTable>
          <DataTable.Row>
            <DataTable.Title>Current balance</DataTable.Title>
            <DataTable.Cell numeric>{formatCents(membership?.creditsCents)}</DataTable.Cell>
          </DataTable.Row>
          <DataTable.Row>
            <DataTable.Title>
              {type === TransactionType.Withdrawal ? 'Withdraw' : 'Deposit'}
            </DataTable.Title>
            <DataTable.Cell numeric>
              {[type === TransactionType.Deposit ? '+' : '-', '$', amount].join('')}
            </DataTable.Cell>
          </DataTable.Row>
          <DataTable.Row>
            <DataTable.Title>
              <Text style={{ fontWeight: 'bold' }}>New total</Text>
            </DataTable.Title>
            <DataTable.Cell numeric>
              {[subtotal < 0 ? '-' : '', '$', subtotal < 0 ? subtotal * -1 : subtotal].join('')}
            </DataTable.Cell>
          </DataTable.Row>
        </DataTable>
      </View>
    </>
  );
}
