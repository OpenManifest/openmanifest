import { ActivityTypeEssentialsFragment } from 'app/api/operations';
import { useAllowedActivityTypesQuery } from 'app/api/reflection';
import { useSession } from 'app/state';
import * as React from 'react';
import Select from '../select/Select';
import { withHookForm } from '../withHookForm';

interface IActivityTypeSelect {
  value?: ActivityTypeEssentialsFragment | null;
  allowedForMembershipIds?: number[] | null;
  onChange(jt: ActivityTypeEssentialsFragment): void;
}

function ActivityTypeSelect(props: IActivityTypeSelect) {
  const { allowedForMembershipIds, onChange, value } = props;
  const currentOperatorId = useSession((session) => session.currentOperatorId);

  const { data } = useAllowedActivityTypesQuery({
    variables: {
      operatorId: currentOperatorId?.toString() as string,
      allowedForMembershipIds: allowedForMembershipIds as number[],
    },
  });

  const options = React.useMemo(
    () =>
      data?.activityTypes?.map((node) => ({
        label: node?.name || '',
        value: node as ActivityTypeEssentialsFragment,
      })) || [],
    [data?.activityTypes]
  );

  const selected = React.useMemo(
    () => options?.map((option) => option.value).find((node) => node?.id === value?.id),
    [options, value?.id]
  );
  return (
    <Select<ActivityTypeEssentialsFragment>
      label="Jump type"
      value={selected}
      options={options}
      onChange={onChange}
    />
  );
}

export const ActivityTypeSelectField = withHookForm(ActivityTypeSelect);

export default ActivityTypeSelect;
