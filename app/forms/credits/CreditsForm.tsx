import * as React from 'react';
import { Text, View } from 'react-native';
import { FormTextField } from 'app/components/input/text/TextField';
import { Divider, DataTable } from 'react-native-paper';
import { TransactionType } from 'app/api/schema.d';
import { Control, useWatch } from 'react-hook-form';
import { FormNumberField } from 'app/components/input/number_input';
import { DropzoneUserDetailsFragment } from 'app/api/operations';
import { NumberFieldType } from '../../components/input/number_input/NumberField';
import { CreditFields } from './useForm';

interface ICreditsFormProps {
  control: Control<CreditFields>;
  dropzoneUser?: DropzoneUserDetailsFragment;
}
export default function CreditsForm(props: ICreditsFormProps) {
  const { control, dropzoneUser } = props;
  const { amount = 0, type } = useWatch({ control });

  const subtotal =
    type === TransactionType.Deposit
      ? (dropzoneUser?.credits || 0) + amount
      : (dropzoneUser?.credits || 0) - amount;
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
            <DataTable.Cell numeric>{`$${dropzoneUser?.credits || 0}`}</DataTable.Cell>
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
