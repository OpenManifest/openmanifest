import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Menu, Tappable } from 'app/ui';
import { useMembershipsQuery } from 'app/api/reflection';
import type { MembershipEssentialsFragment } from 'app/api/operations';
import type { Permission } from 'app/api/schema.d';
import { useSession } from 'app/state';
import CrewChip from 'app/features/board/CrewChip';
import type { CrewSlot } from 'app/features/board/crew';

export type CrewRoleMenuProps = {
  crew: CrewSlot;
  /** Fills the role (for a vehicle, when it is a role per vehicle) with the member; absent when the role cannot be changed */
  onSelect?(member: MembershipEssentialsFragment): void;
  testID?: string;
};

/** A crew role of the load and who fills it; pressed, it lists the members who may fill it (those with the role's permission) */
export default function CrewRoleMenu({
  crew,
  onSelect,
  testID = `crew-${crew.key}`,
}: CrewRoleMenuProps) {
  if (!onSelect) {
    return (
      <CrewChip
        role={crew.role}
        label={crew.label}
        member={crew.member}
        testID={`${testID}-chip`}
      />
    );
  }
  return <CrewRoleChooser crew={crew} onSelect={onSelect} testID={testID} />;
}

/** The menu itself: it asks for the members, so a role that cannot be changed does not */
function CrewRoleChooser({
  crew,
  onSelect,
  testID,
}: Pick<CrewRoleMenuProps, 'crew'> & {
  onSelect: NonNullable<CrewRoleMenuProps['onSelect']>;
  testID: string;
}) {
  const { t } = useTranslation('common');
  const operatorId = useSession((session) => session.currentOperatorId);
  const { role, label, member } = crew;
  const { data } = useMembershipsQuery({
    variables: {
      operatorId: operatorId?.toString() as string,
      permissions: role.permission ? [role.permission as Permission] : undefined,
    },
    skip: !operatorId,
  });
  const chip = <CrewChip role={role} label={label} member={member} testID={`${testID}-chip`} />;

  const options = (data?.memberships?.edges ?? [])
    .map((edge) => edge?.node)
    .filter((node): node is MembershipEssentialsFragment => !!node);
  const name = label ?? role.name;

  return (
    <Menu
      label={t('load.fillRole', { role: name })}
      testID={testID}
      trigger={
        <Tappable
          role="button"
          aria-label={t('load.fillRole', { role: name })}
          testID={`${testID}-open`}
          minTarget={false}
        >
          {chip}
        </Tappable>
      }
      items={options.map((option) => ({
        label: option.user.name ?? '',
        selected: option.id === member?.id,
        leading: <Avatar name={option.user.name ?? ''} imageUri={option.user.image} size="sm" />,
        testID: `${testID}-${option.id}`,
        onPress: () => onSelect(option),
      }))}
    />
  );
}
