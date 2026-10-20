import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconButton, NumberField, Text, useTheme } from 'app/ui';
import useManifestValidator from 'app/hooks/useManifestValidator';
import { defaultsOf, type PickerMember } from './members';

export type GroupCardProps = {
  loadId: string;
  members: readonly PickerMember[];
  /** The ticket and type of jump the whole group takes */
  ticketTypeId: string | null;
  activityTypeId: string | null;
  groupNumber: number;
  /** The shared pick (ticket and activity), above the people */
  choices?: React.ReactNode;
  /** An exit weight someone changed from the one on their profile or last slot */
  masses: Readonly<Record<string, number | null | undefined>>;
  onMass(memberId: string, mass: number | null): void;
  onRemove(memberId: string): void;
  /** Whether each person can go on with what the group is taking: `null` when they are taken out */
  onReady(memberId: string, ready: boolean | null): void;
  testID?: string;
};

type GroupMemberProps = Omit<GroupCardProps, 'members' | 'choices'> & {
  member: PickerMember;
};

/** A person of the group: their exit weight, what the server says about them with this ticket, and a way to take them out */
function GroupMember({
  member,
  loadId,
  ticketTypeId,
  activityTypeId,
  groupNumber,
  masses,
  onMass,
  onRemove,
  onReady,
  testID = 'picker-group',
}: GroupMemberProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const defaults = React.useMemo(() => defaultsOf(member), [member]);
  const mass = masses[member.id] === undefined ? defaults.bodyMassKg : masses[member.id];
  const validation = useManifestValidator(
    {
      loadId,
      membershipId: member.id,
      ticketTypeId,
      activityTypeId,
      equipmentIds: defaults.equipmentIds,
      bodyMassKg: mass,
      groupNumber,
    },
    150
  );
  const ready =
    !!ticketTypeId && !!activityTypeId && !!mass && validation.canManifest && !validation.loading;
  React.useEffect(() => {
    onReady(member.id, ready);
  }, [member.id, onReady, ready]);
  React.useEffect(() => () => onReady(member.id, null), [member.id, onReady]);
  const name = member.user.nickname || member.user.name || '';

  return (
    <View style={{ gap: theme.space.xs }} testID={`${testID}-${member.id}`}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: theme.space.sm }}>
        <View style={{ flex: 1 }}>
          <NumberField
            label={t('picker.group.mass', { name })}
            value={mass}
            onChange={(value) => onMass(member.id, value)}
            min={0}
            max={300}
            unit="kg"
            hideSteppers
            testID={`${testID}-${member.id}-mass`}
          />
        </View>
        <IconButton
          icon="close"
          aria-label={t('picker.group.remove', { name })}
          onPress={() => onRemove(member.id)}
          testID={`${testID}-${member.id}-remove`}
        />
      </View>
      {validation.failures.map((result) => (
        <Text
          key={`${result.code}-${result.problem}`}
          variant="caption"
          tone={result.bypassed ? 'warning' : 'blocked'}
          testID={`${testID}-${member.id}-failure-${result.code}`}
        >
          {name}: {result.message}
        </Text>
      ))}
    </View>
  );
}

/**
 * The people picked for a group, with the ticket and the type of jump they share: each has their own exit weight, and the
 * server's word on them with the shared ticket. The group goes on one group number.
 */
export default function GroupCard({
  members,
  choices,
  testID = 'picker-group',
  ...shared
}: GroupCardProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();

  return (
    <View
      testID={testID}
      style={{
        gap: theme.space.md,
        padding: theme.space.md,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colour.border,
        backgroundColor: theme.colour.surface,
      }}
    >
      <Text variant="label">{t('picker.group.title', { count: members.length })}</Text>
      {choices}
      {members.map((member) => (
        <GroupMember key={member.id} member={member} testID={testID} {...shared} />
      ))}
    </View>
  );
}
