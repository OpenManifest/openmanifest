import * as React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, HelperText, List } from 'react-native-paper';

import { useAppSelector, useAppDispatch } from '../../../redux';

import slice from "./slice";
import DatePicker from '../../DatePicker';
import RoleSelect from '../../RoleSelect';
import useRestriction from '../../../hooks/useRestriction';
import ScrollableScreen from '../../ScrollableScreen';

const { actions } = slice;

export default function DropzoneUserForm() {
  const { dropzoneUserForm: state, global: globalState} = useAppSelector(state => state);
  const dispatch = useAppDispatch();
  const canUpdateRole = useRestriction("updatePermission");

  return ( 
    <>
      <RoleSelect
        value={state.fields.role.value}
        onSelect={(newRole) => dispatch(actions.setField(["role", newRole]))}
        disabled={!canUpdateRole}
        required
      />
      <HelperText type={!!state.fields.role.error ? "error" : "info"}>
        { state.fields.role.error }
      </HelperText>


      <List.Subheader style={{ paddingLeft: 0 }}>
        Financial
      </List.Subheader>
      <DatePicker
        timestamp={state.fields.expiresAt.value || new Date().getTime() / 1000}
        onChange={(time) => dispatch(actions.setField(["expiresAt", time]))}
        label="Membership expires"
      />
      <HelperText type={!!state.fields.expiresAt.error ? "error" : "info"}>
        { state.fields.expiresAt.error }
      </HelperText>
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
