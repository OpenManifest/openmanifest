import { uniqBy } from 'lodash';
import * as React from 'react';
import { List } from 'react-native-paper';
import { Permission } from 'app/api/schema.d';
import { useSession } from 'app/state';
import { useMembershipsQuery } from 'app/api/reflection';
import { MembershipEssentialsFragment } from 'app/api/operations';
import { ChipProps } from 'app/components/chips/Chip';
import ChipSelect from './ChipSelect';
import type { IChipSelect } from './ChipSelect';
import ChipSelectSkeleton from './ChipSelectSkeleton';
import { withHookForm } from '../withHookForm';

interface IMembershipChipSelect extends Pick<IChipSelect<unknown>, 'variant' | 'error'> {
  value?: MembershipEssentialsFragment | null;
  label: string;
  icon?: ChipProps['icon'];
  requiredPermissions: Permission[];
  onLoadingStateChanged?(loading: boolean): void;
  onChange(dzuser: MembershipEssentialsFragment): void;
}

function MembershipChipSelect(props: IMembershipChipSelect) {
  const {
    label,
    requiredPermissions,
    icon,
    value,
    variant,
    error,
    onLoadingStateChanged,
    onChange,
  } = props;
  const currentOperatorId = useSession((session) => session.currentOperatorId);

  const { data, loading } = useMembershipsQuery({
    variables: {
      operatorId: currentOperatorId?.toString() as string,
      permissions: requiredPermissions,
    },
  });

  React.useEffect(() => {
    onLoadingStateChanged?.(loading);
  }, [loading, onLoadingStateChanged]);

  const onChangeSelected = React.useCallback(
    ([first]: MembershipEssentialsFragment[]) => (first ? onChange(first) : null),
    [onChange]
  );
  const getItemLabel = React.useCallback(
    (dzUser: MembershipEssentialsFragment) => dzUser?.user.name,
    []
  );
  const isSelected = React.useCallback(
    (item: MembershipEssentialsFragment) => item.id === value?.id,
    [value?.id]
  );
  const selected = React.useMemo(
    () => [value].filter(Boolean) as MembershipEssentialsFragment[],
    [value]
  );

  return loading ? (
    <ChipSelectSkeleton />
  ) : (
    <>
      <List.Subheader>{label}</List.Subheader>
      <ChipSelect<MembershipEssentialsFragment>
        {...{ error, variant }}
        autoSelectFirst
        icon={icon || 'account'}
        items={
          uniqBy(
            data?.memberships?.edges?.map((edge) => edge?.node) || [],
            (node) => node?.id
          ) as MembershipEssentialsFragment[]
        }
        value={selected}
        isSelected={isSelected}
        renderItemLabel={getItemLabel}
        onChange={onChangeSelected}
      />
    </>
  );
}

export const MembershipChipSelectField = withHookForm(MembershipChipSelect);

export default MembershipChipSelect;
