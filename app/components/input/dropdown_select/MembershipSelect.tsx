import { MembershipEssentialsFragment } from 'app/api/operations';
import { useMembershipsQuery } from 'app/api/reflection';
import * as React from 'react';
import { Text } from 'app/ui';
import { Membership, Permission } from '../../../api/schema.d';
import { useSession } from '../../../state';
import Select from '../select/Select';
import { withHookForm } from '../withHookForm';

interface IMembershipSelect {
  requiredPermissions?: Permission[];
  value: Membership | null;
  label: string;
  onChange(dzUser: Membership): void;
}

function MembershipSelect(props: IMembershipSelect) {
  const { requiredPermissions, value, onChange, label } = props;
  const currentOperatorId = useSession((session) => session.currentOperatorId);

  const { data } = useMembershipsQuery({
    variables: {
      operatorId: currentOperatorId?.toString() as string,
      permissions: requiredPermissions,
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

  return (
    <>
      <Text variant="title">{label}</Text>
      <Select<MembershipEssentialsFragment>
        value={selected}
        compare={(a, b) => a?.id === b?.id}
        options={options}
        onChange={onChange}
      />
    </>
  );
}

export const MembershipSelectField = withHookForm(MembershipSelect);

export default MembershipSelect;
