import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text, useTheme, type IconName } from 'app/ui';

/** The icon a role has on its chip; the roles an operator adds have the plain person */
const ICON: Record<string, IconName> = {
  pilot: 'account-tie-hat',
  gca: 'account-star',
  load_master: 'shield-account',
};

export type CrewChipProps = {
  role: { key: string; name: string; required?: boolean | null };
  /** Names the chip when the role is filled once for each vehicle: "Guide · Raft 2" */
  label?: string;
  /** Who fills it */
  member?: { user: { name?: string | null; nickname?: string | null } } | null;
  testID?: string;
};

/**
 * One crew role of a load and who fills it. An empty role the load needs is flagged in words ("Pilot needed") and by
 * colour; an optional one that nobody fills is quiet.
 */
export default function CrewChip({ role, label, member, testID }: CrewChipProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const name = label ?? role.name;
  const person = member?.user.nickname || member?.user.name;
  const missing = !person && !!role.required;
  const shown = person ?? t(missing ? 'board.crew.needed' : 'board.crew.none', { role: name });
  const spoken = person ? t('board.crew.filled', { role: name, name: person }) : shown;
  const { fg, bg } = theme.colour.status.warning;

  return (
    <View
      testID={testID}
      accessible
      aria-label={spoken}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space.xs,
        paddingHorizontal: theme.space.sm,
        paddingVertical: theme.space.xs,
        borderRadius: theme.radius.pill,
        borderWidth: 1,
        borderColor: missing ? fg : theme.colour.border,
        backgroundColor: missing ? bg : 'transparent',
      }}
    >
      <Icon name={ICON[role.key] ?? 'account'} size={16} tone={missing ? 'warning' : 'muted'} />
      <Text variant="caption" chrome aria-hidden tone={missing ? 'warning' : 'default'}>
        {shown}
      </Text>
    </View>
  );
}
