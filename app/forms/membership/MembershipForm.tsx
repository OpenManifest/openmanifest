import * as React from 'react';
import { Control, useController } from 'react-hook-form';
import DatePicker from 'app/components/input/date_picker';
import RoleSelect from 'app/components/input/dropdown_select/RoleSelect';
import useRestriction from 'app/hooks/useRestriction';
import { Permission } from 'app/api/schema.d';
import { MembershipFields } from './useForm';
import { useTranslation } from 'react-i18next';
import { FieldError, Stack, Subheader } from 'app/ui';

export interface IMembershipFormProps {
  control: Control<MembershipFields>;
}

export default function MembershipForm(props: IMembershipFormProps) {
  const { t } = useTranslation('common');
  const { control } = props;
  const canUpdateRole = useRestriction(Permission.GrantPermission);
  const { field: role, fieldState: roleState } = useController({ name: 'role', control });
  const { field: expiresAt, fieldState: expiresAtState } = useController({
    name: 'expiresAt',
    control,
  });

  return (
    <Stack gap="md">
      <RoleSelect value={role.value} onChange={role.onChange} disabled={!canUpdateRole} />
      <FieldError>{roleState.error?.message}</FieldError>

      <Subheader>{t('forms.membership.financial')}</Subheader>
      <DatePicker
        value={expiresAt.value || new Date().getTime() / 1000}
        onChange={expiresAt.onChange}
        label={t('forms.membership.membershipExpires')}
      />
      <FieldError>{expiresAtState.error?.message}</FieldError>
    </Stack>
  );
}
