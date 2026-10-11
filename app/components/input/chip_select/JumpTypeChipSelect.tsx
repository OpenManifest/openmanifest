import { JumpTypeEssentialsFragment } from 'app/api/operations';
import { useAllowedJumpTypesQuery } from 'app/api/reflection';
import { uniqBy } from 'lodash';
import * as React from 'react';
import { useSession } from 'app/state';
import { List } from 'react-native-paper';
import { JumpType } from '../../../api/schema.d';
import { withHookForm } from '../withHookForm';
import ChipSelect from './ChipSelect';
import ChipSelectSkeleton from './ChipSelectSkeleton';

interface IJumpTypeSelect {
  value?: JumpTypeEssentialsFragment | null;
  userId?: number | null;
  error?: string | null;
  onLoadingStateChanged?(loading: boolean): void;
  onChange(jt: JumpTypeEssentialsFragment): void;
}

function JumpTypeChipSelect(props: IJumpTypeSelect) {
  const { onLoadingStateChanged, userId, value, onChange, error } = props;
  const currentOperatorId = useSession((session) => session.currentOperatorId);
  const { data, loading } = useAllowedJumpTypesQuery({
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
      <List.Subheader>Jump type</List.Subheader>
      <ChipSelect<JumpTypeEssentialsFragment>
        {...{ error }}
        autoSelectFirst
        items={
          uniqBy(
            [...(data?.operator?.allowedJumpTypes || []), ...(data?.jumpTypes || [])],
            ({ id }) => id
          ) || []
        }
        value={[value].filter(Boolean) as JumpType[]}
        renderItemLabel={(jumpType) => jumpType?.name || 'Unknown'}
        isDisabled={(jumpType) =>
          !data?.operator?.allowedJumpTypes?.map(({ id }) => id).includes(jumpType?.id)
        }
        onChange={([first]) => (first ? onChange(first) : null)}
      />
    </>
  );
}

export const JumpTypeChipSelectField = withHookForm(JumpTypeChipSelect);

export default JumpTypeChipSelect;
