import { useMembershipsQuery } from 'app/api/reflection';
import * as React from 'react';
import { useSession } from 'app/state';
import { useTheme } from 'react-native-paper';
import Select, { ISelectOption } from 'app/components/input/select/Select';
import { MembershipEssentialsFragment } from 'app/api/operations';
import { truncate } from 'lodash';
import { View } from 'react-native';
import Chip from './Chip';

import { Permission } from '../../api/schema.d';
import useRestriction from '../../hooks/useRestriction';

interface IGCAChipSelect {
  value?: { id: string; user: { id: string; name?: string | null } } | null;
  small?: boolean;
  backgroundColor?: string;
  color?: string;

  onSelect(user: { id: string; user: { id: string; name?: string | null } }): void;
}

export default function GCAChip(props: IGCAChipSelect) {
  const { small, color: assignedColor, backgroundColor, onSelect, value } = props;
  const theme = useTheme();
  const color = assignedColor || theme.colors.onSurface;
  const currentOperatorId = useSession((session) => session.currentOperatorId);

  const { data } = useMembershipsQuery({
    variables: {
      operatorId: currentOperatorId?.toString() as string,
      permissions: [Permission.ActAsGca],
    },
  });
  const allowed = useRestriction(Permission.UpdateLoad);

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
      <Chip {...{ backgroundColor, small, color, onPress: openMenu }} icon="radio-handheld">
        {truncate(item?.label || 'No GCA', { length: 12 })}
      </Chip>
    ),
    [backgroundColor, color, small]
  );

  return (
    <View style={{ maxWidth: 100 }}>
      {!allowed ? (
        <Chip {...{ backgroundColor, small, color }} icon="radio-handheld">
          {value?.user?.name || 'No gca'}
        </Chip>
      ) : (
        <Select<MembershipEssentialsFragment>
          value={selected}
          options={options}
          onChange={onSelect}
          renderAnchor={renderAnchor}
        />
      )}
    </View>
  );
}
