import { ActivityTypeEssentialsFragment } from 'app/api/operations';
import { useAllowedActivityTypesQuery } from 'app/api/reflection';
import { uniqBy } from 'lodash';
import * as React from 'react';
import { useSession } from 'app/state';
import { useTranslation } from 'react-i18next';
import { Subheader } from 'app/ui';
import { ActivityType } from '../../../api/schema.d';
import { withHookForm } from '../withHookForm';
import ChipSelect from './ChipSelect';
import ChipSelectSkeleton from './ChipSelectSkeleton';

interface IActivityTypeSelect {
  value?: ActivityTypeEssentialsFragment | null;
  userId?: number | null;
  error?: string | null;
  onLoadingStateChanged?(loading: boolean): void;
  onChange(jt: ActivityTypeEssentialsFragment): void;
}

function ActivityTypeChipSelect(props: IActivityTypeSelect) {
  const { t } = useTranslation(['common', 'terms']);
  const { onLoadingStateChanged, userId, value, onChange, error } = props;
  const currentOperatorId = useSession((session) => session.currentOperatorId);
  const { data, loading } = useAllowedActivityTypesQuery({
    variables: {
      allowedForMembershipIds: [Number(userId) || null].filter(Boolean) as number[],
      operatorId: currentOperatorId?.toString() as string,
    },
    onError: console.error,
  });

  React.useEffect(() => {
    onLoadingStateChanged?.(loading);
  }, [loading, onLoadingStateChanged]);

  return loading ? (
    <ChipSelectSkeleton />
  ) : (
    <>
      <Subheader>{t('terms:activity', { count: 1 })}</Subheader>
      <ChipSelect<ActivityTypeEssentialsFragment>
        {...{ error }}
        autoSelectFirst
        items={
          uniqBy(
            [...(data?.operator?.allowedActivityTypes || []), ...(data?.activityTypes || [])],
            ({ id }) => id
          ) || []
        }
        value={[value].filter(Boolean) as ActivityType[]}
        renderItemLabel={(activityType) => activityType?.name || 'Unknown'}
        isDisabled={(activityType) =>
          !data?.operator?.allowedActivityTypes?.map(({ id }) => id).includes(activityType?.id)
        }
        onChange={([first]) => (first ? onChange(first) : null)}
      />
    </>
  );
}

export const ActivityTypeChipSelectField = withHookForm(ActivityTypeChipSelect);

export default ActivityTypeChipSelect;
