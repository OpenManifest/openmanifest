import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { CrewRoleEssentialsFragment } from 'app/api/operations';
import { ResourceForm } from 'app/ui';
import CrewRoleForm from './CrewRoleForm';
import { ANYONE } from './key';
import useForm from './useForm';

export interface ICrewRoleDialogProps {
  open: boolean;
  /** The role being edited; none for a new one */
  original?: CrewRoleEssentialsFragment | null;
  onClose(): void;
  onArchive?(): void;
}

export default function CrewRoleDialog({ open, original, onClose, onArchive }: ICrewRoleDialogProps) {
  const { t } = useTranslation('common');
  const initial = React.useMemo(
    () =>
      original
        ? {
            id: original.id,
            name: original.name,
            scope: original.scope,
            required: original.required,
            occupiesSlot: original.occupiesSlot,
            permission: original.permission || ANYONE,
          }
        : undefined,
    [original]
  );
  const { control, loading, onSubmit, reset } = useForm({ initial, onSuccess: onClose });

  React.useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  return (
    <ResourceForm
      {...{ open, loading, onClose, onArchive, onSubmit }}
      title={
        original?.id
          ? t('forms.crew_role.edit', { name: original.name })
          : t('forms.crew_role.new')
      }
    >
      <CrewRoleForm {...{ control }} />
    </ResourceForm>
  );
}
