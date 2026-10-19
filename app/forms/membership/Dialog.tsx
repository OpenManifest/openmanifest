import { useApolloClient } from '@apollo/client';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Overlay, Row, Stack, Subheader } from 'app/ui';
import PermissionBadges from 'app/screens/authenticated/user/profile/UserInfo/PermissionBadges';
import { Membership, Permission } from 'app/api/schema.d';
import type { MembershipEssentialsFragment, MembershipProfileFragment } from 'app/api/operations';
import { MembershipProfileFragmentDoc } from 'app/api/reflection';
import MembershipForm from './MembershipForm';
import useMembershipForm from './useForm';

export interface IMembershipDialogProps {
  open?: boolean;
  /** The member being edited */
  membership?: MembershipEssentialsFragment | null;
  onClose(): void;
  onSuccess?(user: MembershipEssentialsFragment): void;
}

export default function MembershipDialog(props: IMembershipDialogProps) {
  const { open, membership, onClose, onSuccess } = props;
  const { t } = useTranslation('common');
  const client = useApolloClient();
  const { control, loading, onSubmit } = useMembershipForm({
    membership,
    onSuccess: (user) => {
      onSuccess?.(user);
      onClose();
    },
  });

  const cachedUser = membership
    ? client.readFragment<MembershipProfileFragment>({
        fragment: MembershipProfileFragmentDoc,
        fragmentName: 'membershipProfile',
        id: client.cache.identify(membership),
      })
    : null;

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
        {cachedUser ? (
          <>
            <Subheader>{t('forms.membership.actingPermissions')}</Subheader>
            <PermissionBadges
              membership={cachedUser as Membership}
              permissions={
                (cachedUser as Membership).permissions?.filter((name) =>
                  /^actAs/.test(name)
                ) as Permission[]
              }
            />
          </>
        ) : null}
      </Stack>
    </Overlay>
  );
}
