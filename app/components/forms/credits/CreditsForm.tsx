import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput, HelperText, Divider, DataTable } from 'react-native-paper';
import { actions, useAppSelector, useAppDispatch } from '../../../state';

export default function CreditsForm() {
  const state = useAppSelector((root) => root.forms.credits);
  const dispatch = useAppDispatch();

  const currentCredits = state.original?.credits || 0;
  const amount = state.fields.amount.value || 0;

  const subtotal =
    state.fields.status.value === 'deposit' ? amount + currentCredits : amount - currentCredits;
  return (
    <>
      <TextInput
        style={styles.field}
        mode="outlined"
        label="Message"
        error={!!state.fields.message.error}
        value={state.fields.message.value?.toString() || ''}
        onChangeText={(newValue: string) =>
          dispatch(actions.forms.credits.setField(['message', newValue]))
        }
      />
      <HelperText type={state.fields.message.error ? 'error' : 'info'}>
        {state.fields.message.error || ''}
      </HelperText>
      {state.fields.status.value === 'deposit' ? (
        <View>
          <TextInput
            style={styles.field}
            mode="outlined"
            label="Add amount"
            error={!!state.fields.amount.error}
            value={state.fields.amount.value?.toString() || ''}
            keyboardType="number-pad"
            onChangeText={(newValue: string) =>
              dispatch(actions.forms.credits.setField(['amount', Number(newValue)]))
            }
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
          <TextInput
            style={styles.field}
            mode="outlined"
            label="Withdraw amount"
            error={!!state.fields.amount.error}
            value={state.fields.amount.value?.toString() || ''}
            keyboardType="number-pad"
            onChangeText={(newValue: string) =>
              dispatch(actions.forms.credits.setField(['amount', Number(newValue)]))
            }
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

const styles = StyleSheet.create({
  fields: {
    flex: 1,
  },
  field: {
    marginBottom: 8,
  },
});
