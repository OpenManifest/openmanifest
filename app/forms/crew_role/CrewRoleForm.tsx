import * as React from 'react';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CrewRoleScope, Permission } from 'app/api/schema.d';
import useTerms from 'app/i18n/useTerms';
import { FormSegmented, FormSelect, FormSwitch, FormTextField, Stack } from 'app/ui';
import { ANYONE, crewPermissions } from './key';
import { CrewRoleFields } from './useForm';

export interface ICrewRoleFormProps {
  control: Control<CrewRoleFields>;
}

/** Name, how often the role is filled, whether it must be and takes a seat, and who may fill it */
export default function CrewRoleForm({ control }: ICrewRoleFormProps) {
  const { t } = useTranslation('common');
  const term = useTerms();
  const words = {
    load: term('load').toLowerCase(),
    vehicle: term('vehicle').toLowerCase(),
    equipment: term('equipment'),
  };

  return (
    <Stack gap="md">
      <FormTextField {...{ control }} name="name" label={t('forms.fields.name')} />
      <FormSegmented
        {...{ control }}
        name="scope"
        label={t('forms.crew_role.scope')}
        options={[
          { value: CrewRoleScope.Load, label: t('forms.crew_role.scopes.load', words) },
          { value: CrewRoleScope.Vehicle, label: t('forms.crew_role.scopes.vehicle', words) },
        ]}
      />
      <FormSwitch
        {...{ control }}
        name="required"
        label={t('forms.crew_role.required')}
        helperText={t('forms.crew_role.requiredHelp', words)}
      />
      <FormSwitch
        {...{ control }}
        name="occupiesSlot"
        label={t('forms.crew_role.occupiesSlot')}
        helperText={t('forms.crew_role.occupiesSlotHelp', words)}
      />
      <FormSelect
        {...{ control }}
        name="permission"
        label={t('forms.crew_role.permission')}
        helperText={t('forms.crew_role.permissionHelp')}
        options={[
          { value: ANYONE, label: t('forms.crew_role.anyone') },
          ...crewPermissions(Object.values(Permission)).map((permission) => ({
            value: permission,
            label: t(`profile.acting.${permission}`, { ...words, defaultValue: permission }),
          })),
        ]}
      />
    </Stack>
  );
}
