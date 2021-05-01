import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput, HelperText, List, Divider, Dialog, DataTable } from 'react-native-paper';
import { Tabs, TabScreen } from "react-native-paper-tabs";
import { useAppSelector, useAppDispatch } from '../../../redux';
import useRestriction from '../../../hooks/useRestriction';

import slice from "./slice";

const { actions } = slice;

export default function CreditsForm() {
  const { creditsForm: state, global: globalState} = useAppSelector(state => state);
  const dispatch = useAppDispatch();
  const canUpdateRole = useRestriction("updatePermission");

  const currentCredits = (state.original?.credits || 0)
  const amount = (state.fields.amount.value || 0);

  const subtotal = state.fields.status.value === "deposit"
    ? amount + currentCredits
    : amount - currentCredits;
  return ( 
    <>
      <Tabs
        defaultIndex={0} // default = 0
        onChangeIndex={(newIndex) => {
          dispatch(actions.setField(["status", newIndex === 1 ? "withdrawal" : "deposit"]));
        }}
        mode="fixed"
      >
        <TabScreen label="Deposit" icon="arrow-up"><View /></TabScreen>
        <TabScreen label="Withdraw" icon="arrow-down"><View /></TabScreen>
      </Tabs>
      <Dialog.Content style={{ paddingTop: 16 }}>
          <TextInput
            style={styles.field}
            mode="outlined"
            label="Message"
            error={!!state.fields.message.error}
            value={state.fields.message.value?.toString() || ""}
            onChangeText={(newValue: string) => dispatch(actions.setField(["message", newValue]))}
          />
          <HelperText type={!!state.fields.message.error ? "error" : "info"}>
            { state.fields.message.error || "" }
          </HelperText>
          { state.fields.status.value === "deposit" 
            ? (
                <View>
                  
                  <TextInput
                    style={styles.field}
                    mode="outlined"
                    label="Add amount"
                    error={!!state.fields.amount.error}
                    value={state.fields.amount.value?.toString() || ""}
                    keyboardType="number-pad"
                    onChangeText={(newValue: string) => dispatch(actions.setField(["amount", Number(newValue)]))}
                  />
                  <HelperText type={!!state.fields.amount.error ? "error" : "info"}>
                    { state.fields.amount.error || "" }
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
                        <Text style={{ fontWeight: "bold" }}>New total</Text>
                      </DataTable.Title>
                      <DataTable.Cell numeric>{`${subtotal < 0 ? "-" : ""}$${subtotal < 0 ? subtotal * -1 : subtotal}`}</DataTable.Cell>
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
                    value={state.fields.amount.value?.toString() || ""}
                    keyboardType="number-pad"
                    onChangeText={(newValue: string) => dispatch(actions.setField(["amount", Number(newValue)]))}
                  />
                  <HelperText type={!!state.fields.amount.error ? "error" : "info"}>
                    { state.fields.amount.error || "" }
                  </HelperText>

                  <Divider />

                  <DataTable>
                    <DataTable.Row>
                      <DataTable.Title>Current balance</DataTable.Title>
                      <DataTable.Cell numeric>{`$${state.original!.credits || 0}`}</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                      <DataTable.Title>Withdraw</DataTable.Title>
                      <DataTable.Cell numeric>{`-$${state.fields.amount.value || 0}`}</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                      <DataTable.Title>
                        <Text style={{ fontWeight: "bold" }}>New total</Text>
                      </DataTable.Title>
                      <DataTable.Cell numeric>{`${subtotal < 0 ? "-" : ""}$${subtotal < 0 ? subtotal * -1 : subtotal}`}</DataTable.Cell>
                    </DataTable.Row>
                  </DataTable>
                </View>
            )}
      </Dialog.Content>
      </>
  );
}

const styles = StyleSheet.create({
  fields: {
    flex: 1,
  },
  field: {
    marginBottom: 8,
  }
});
