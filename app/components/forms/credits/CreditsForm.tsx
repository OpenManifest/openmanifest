import * as React from 'react';
import { Text, View } from 'react-native';
import TextInput from 'app/components/input/text/TextField';
import { HelperText, Divider, DataTable } from 'react-native-paper';
import { actions, useAppSelector, useAppDispatch } from 'app/state';
import { TransactionType } from 'app/api/schema.d';
import NumberField, { NumberFieldType } from '../../input/number_input/NumberField';

export default function CreditsForm() {
  const state = useAppSelector((root) => root.forms.credits);
  const dispatch = useAppDispatch();

  const currentCredits = state.original?.credits || 0;
  const amount = state.fields.amount.value || 0;

  const subtotal =
    state.fields.transactionType.value === TransactionType.Deposit
      ? amount + currentCredits
      : amount - currentCredits;
  return (
    <>
      <TextInput
        label="Message"
        value={state.fields.message.value?.toString() || ''}
        style={{ marginHorizontal: 8 }}
        onChange={(newValue: string) =>
          dispatch(actions.forms.credits.setField(['message', newValue]))
        }
      />
      {state.fields.transactionType.value === 'deposit' ? (
        <View>
          <NumberField
            variant={NumberFieldType.Cash}
            label="Add amount"
            error={state.fields.amount.error}
            value={state.fields.amount.value}
            onChange={(newValue) => dispatch(actions.forms.credits.setField(['amount', newValue]))}
          />
          <Divider />

          <DataTable>
            <DataTable.Row>
              <DataTable.Title>Current balance</DataTable.Title>
              <DataTable.Cell numeric>{`$${state.original?.credits || 0}`}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Title>Deposit</DataTable.Title>
              <DataTable.Cell numeric>{`+$${state.fields.amount.value || 0}`}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Title>
                <Text style={{ fontWeight: 'bold' }}>New total</Text>
              </DataTable.Title>
              <DataTable.Cell numeric>{`${subtotal < 0 ? '-' : ''}$${
                subtotal < 0 ? subtotal * -1 : subtotal
              }`}</DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </View>
      ) : (
        <View>
          <NumberField
            label="Withdraw amount"
            variant={NumberFieldType.Cash}
            error={state.fields.amount.error}
            value={state.fields.amount.value}
            onChange={(newValue) => dispatch(actions.forms.credits.setField(['amount', newValue]))}
          />
          <HelperText type={state.fields.amount.error ? 'error' : 'info'}>
            {state.fields.amount.error || ''}
          </HelperText>

          <Divider />

          <DataTable>
            <DataTable.Row>
              <DataTable.Title>Current balance</DataTable.Title>
              <DataTable.Cell numeric>{`$${state.original?.credits || 0}`}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Title>Withdraw</DataTable.Title>
              <DataTable.Cell numeric>{`-$${state.fields.amount.value || 0}`}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Title>
                <Text style={{ fontWeight: 'bold' }}>New total</Text>
              </DataTable.Title>
              <DataTable.Cell numeric>{`${subtotal < 0 ? '-' : ''}$${
                subtotal < 0 ? subtotal * -1 : subtotal
              }`}</DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </View>
      )}
    </>
  );
}
