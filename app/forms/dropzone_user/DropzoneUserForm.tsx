import * as React from 'react';
import { Control, useController } from 'react-hook-form';
import { HelperText, List } from 'react-native-paper';
import DatePicker from 'app/components/input/date_picker';
import RoleSelect from 'app/components/input/dropdown_select/RoleSelect';
import useRestriction from 'app/hooks/useRestriction';
import { Permission } from 'app/api/schema.d';
import { DropzoneUserFields } from './useForm';

export interface IDropzoneUserFormProps {
  control: Control<DropzoneUserFields>;
}

export default function DropzoneUserForm(props: IDropzoneUserFormProps) {
  const { control } = props;
  const canUpdateRole = useRestriction(Permission.GrantPermission);
  const { field: role, fieldState: roleState } = useController({ name: 'role', control });
  const { field: expiresAt, fieldState: expiresAtState } = useController({
    name: 'expiresAt',
    control,
  });

  return (
    <>
      <RoleSelect value={role.value} onChange={role.onChange} disabled={!canUpdateRole} />
      <HelperText type={roleState.error ? 'error' : 'info'}>{roleState.error?.message}</HelperText>

      <List.Subheader style={{ paddingLeft: 0 }}>Financial</List.Subheader>
      <DatePicker
        value={expiresAt.value || new Date().getTime() / 1000}
        onChange={expiresAt.onChange}
        label="Membership expires"
      />
      <HelperText type={expiresAtState.error ? 'error' : 'info'}>
        {expiresAtState.error?.message}
      </HelperText>
    </>
  );
}
