import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, StatusBadge, type StatusKey } from 'app/ui';
import { formatDate } from 'app/i18n/format';
import { roleLabel } from 'app/features/people/people';
import { useActingLabel } from './ActingPermissions';
import Section, { Fact } from './Section';
import { actingOf, membershipStateOf, type MembershipState } from './profile';

const STATUS: Record<MembershipState, StatusKey> = {
  none: 'info',
  active: 'ok',
  expiring: 'warning',
  expired: 'blocked',
};

export type MembershipSectionProps = {
  roleName?: string | null;
  /** Seconds since the epoch */
  expiresAt?: number | null;
  permissions?: readonly string[] | null;
  /** Edits the role, the expiry and the acting permissions: absent for those who may not */
  onEdit?(): void;
  timeZone?: string | null;
  testID?: string;
};

/** The member's role, until when their membership runs (a date nobody can read two ways) and the crew roles they take */
export default function MembershipSection({
  roleName,
  expiresAt,
  permissions,
  onEdit,
  timeZone,
  testID = 'profile-membership',
}: MembershipSectionProps) {
  const { t } = useTranslation('common');
  const actingLabel = useActingLabel();
  const state = membershipStateOf(expiresAt);
  const acting = actingOf(permissions);

  return (
    <Section
      title={t('profile.membership.title')}
      testID={testID}
      action={
        onEdit ? (
          <Button
            variant="secondary"
            icon="pencil-outline"
            label={t('profile.membership.edit')}
            aria-label={t('profile.membership.editLabel')}
            testID={`${testID}-edit`}
            onPress={onEdit}
          />
        ) : undefined
      }
    >
      <Fact
        label={t('profile.membership.role')}
        value={roleName ? roleLabel(roleName) : t('profile.membership.noRole')}
        testID={`${testID}-role`}
      />
      <Fact
        label={t(`profile.membership.expiresLabel.${state}`)}
        value={expiresAt ? formatDate(expiresAt, timeZone) : t('profile.membership.never')}
        testID={`${testID}-expires`}
        trailing={
          <StatusBadge status={STATUS[state]} label={t(`profile.membership.state.${state}`)} />
        }
      />
      <Fact
        label={t('profile.membership.acting')}
        value={acting.length ? acting.map(actingLabel).join(', ') : t('profile.acting.none')}
        testID={`${testID}-acting`}
      />
    </Section>
  );
}
