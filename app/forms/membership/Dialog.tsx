import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Overlay, Row, Stack, Subheader } from 'app/ui';
import type { Permission } from 'app/api/schema.d';
import type { MembershipEssentialsFragment } from 'app/api/operations';
import ActingPermissions from 'app/features/profile/ActingPermissions';
import MembershipForm from './MembershipForm';
import useMembershipForm from './useForm';

export interface IMembershipDialogProps {
  open?: boolean;
  /** The member being edited */
  membership?: MembershipEssentialsFragment | null;
  /** The permissions the member holds: with them, the acting permissions (pilot, load master, …) are switched here */
  permissions?: readonly (Permission | string)[] | null;
  onClose(): void;
  onSuccess?(user: MembershipEssentialsFragment): void;
}

export default function MembershipDialog(props: IMembershipDialogProps) {
  const { open, membership, permissions, onClose, onSuccess } = props;
  const { t } = useTranslation('common');
  const { control, loading, onSubmit } = useMembershipForm({
    membership,
    onSuccess: (user) => {
      onSuccess?.(user);
      onClose();
    },
  });

  return (
    <Overlay
      open={!!open}
      onClose={onClose}
      presentation="dialog"
      title={membership?.id ? t('forms.membership.edit') : t('forms.membership.new')}
      footer={
        <Row gap="sm" justify="end">
          <Button label={t('forms.cancel')} variant="tertiary" onPress={onClose} />
          <Button label={t('forms.save')} loading={loading} onPress={onSubmit} />
        </Row>
      }
    >
      <Stack gap="md">
        <MembershipForm {...{ control }} />
        {membership?.id && permissions ? (
          <>
            <Subheader>{t('forms.membership.actingPermissions')}</Subheader>
            <ActingPermissions
              membershipId={membership.id}
              permissions={permissions}
              testID="membership-acting"
            />
          </>
        ) : null}
      </Stack>
    </Overlay>
  );
}
