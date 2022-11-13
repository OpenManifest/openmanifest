import * as React from 'react';
import { HelperText, List } from 'react-native-paper';

import { actions, useAppSelector, useAppDispatch } from '../../../state';

import DatePicker from '../../input/date_picker/DatePicker';
import RoleSelect from '../../input/dropdown_select/RoleSelect';
import useRestriction from '../../../hooks/useRestriction';
import { Permission } from '../../../api/schema.d';

export default function DropzoneUserForm() {
  const state = useAppSelector((root) => root.forms.dropzoneUser);
  const dispatch = useAppDispatch();
  const canUpdateRole = useRestriction(Permission.GrantPermission);

  return (
    <>
      <RoleSelect
        value={state.fields.role.value}
        onChange={(newRole) => dispatch(actions.forms.dropzoneUser.setField(['role', newRole]))}
        disabled={!canUpdateRole}
      />
      <HelperText type={state.fields.role.error ? 'error' : 'info'}>
        {state.fields.role.error}
      </HelperText>

      <List.Subheader style={{ paddingLeft: 0 }}>Financial</List.Subheader>
      <DatePicker
        value={state.fields.expiresAt.value || new Date().getTime() / 1000}
        onChange={(time) => dispatch(actions.forms.dropzoneUser.setField(['expiresAt', time]))}
        label="Membership expires"
      />
      <HelperText type={state.fields.expiresAt.error ? 'error' : 'info'}>
        {state.fields.expiresAt.error}
      </HelperText>
    </>
  );
}
