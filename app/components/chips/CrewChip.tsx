import * as React from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { truncate } from 'lodash';
import { CrewRoleEssentialsFragment, MembershipEssentialsFragment } from 'app/api/operations';
import { useMembershipsQuery } from 'app/api/reflection';
import { Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { useSession } from 'app/state';
import type { IconName } from 'app/ui';
import Select, { ISelectOption } from '../input/select/Select';
import Chip from './Chip';

/** The icon a role has on its chip; the roles an operator adds have the plain person */
const ICON: Record<string, IconName> = {
  pilot: 'account-tie-hat',
  gca: 'account-star',
  load_master: 'shield-account',
};

interface ICrewChipProps {
  role: Pick<CrewRoleEssentialsFragment, 'key' | 'name' | 'permission'>;
  /** Names the chip when the role is filled once for each vehicle: "Guide · Raft 2" */
  label?: string;
  value?: { id: string; user: { id: string; name?: string | null } } | null;
  small?: boolean;
  backgroundColor?: string;
  color?: string;
  onSelect(member: MembershipEssentialsFragment): void;
}

/** Who fills a crew role of a load: a chip that opens the members who may fill it (those with the role's permission) */
export default function CrewChip(props: ICrewChipProps) {
  const { role, label, value, small, backgroundColor, color: assignedColor, onSelect } = props;
  const theme = useTheme();
  const color = assignedColor || theme.colors.onSurface;
  const icon = ICON[role.key] ?? 'account';
  const empty = `No ${label ?? role.name}`;
  const currentOperatorId = useSession((session) => session.currentOperatorId);
  const allowed = useRestriction(Permission.UpdateLoad);

  const { data } = useMembershipsQuery({
    variables: {
      operatorId: currentOperatorId?.toString() as string,
      permissions: role.permission ? [role.permission as Permission] : undefined,
    },
  });

  const options = React.useMemo(
    () =>
      data?.memberships?.edges
        ?.filter((edge) => !!edge?.node)
        .map((edge) => ({
          label: edge?.node?.user?.name || '',
          value: edge?.node as MembershipEssentialsFragment,
          avatar: edge?.node?.user?.image,
        })) || [],
    [data?.memberships?.edges]
  );
  const selected = React.useMemo(
    () =>
      data?.memberships?.edges?.map((edge) => edge?.node).find((node) => node?.id === value?.id),
    [data?.memberships?.edges, value?.id]
  );

  const renderAnchor: React.FC<{
    item?: ISelectOption<MembershipEssentialsFragment>;
    openMenu(): void;
  }> = React.useCallback(
    ({ item, openMenu }) => (
      <Chip
        {...{ backgroundColor, small, color, onPress: openMenu }}
        style={{ maxWidth: 120 }}
        icon={icon}
        aria-label={`${label ?? role.name}: ${item?.label || empty}`}
      >
        {truncate(item?.label || empty, { length: 14 })}
      </Chip>
    ),
    [backgroundColor, small, color, icon, label, role.name, empty]
  );

  return !allowed ? (
    <Chip {...{ backgroundColor, small, color }} style={{ maxWidth: 146 }} icon={icon}>
      {value?.user?.name || empty}
    </Chip>
  ) : (
    <View style={{ maxWidth: 146 }}>
      <Select<MembershipEssentialsFragment>
        value={selected}
        options={options}
        renderAnchor={renderAnchor}
        onChange={onSelect}
      />
    </View>
  );
}
