import { JumpTypeEssentialsFragment } from 'app/api/operations';
import { useAllowedJumpTypesQuery } from 'app/api/reflection';
import { useAppSelector } from 'app/state';
import * as React from 'react';
import Select from '../select/Select';
import { withHookForm } from '../withHookForm';

interface IJumpTypeSelect {
  value?: JumpTypeEssentialsFragment | null;
  allowedForDropzoneUserIds?: number[] | null;
  onChange(jt: JumpTypeEssentialsFragment): void;
}

function JumpTypeSelect(props: IJumpTypeSelect) {
  const { allowedForDropzoneUserIds, onChange, value } = props;
  const { currentDropzoneId } = useAppSelector((state) => state.global);

  const { data } = useAllowedJumpTypesQuery({
    variables: {
      dropzoneId: currentDropzoneId?.toString() as string,
      allowedForDropzoneUserIds: allowedForDropzoneUserIds as number[],
    },
  });

  const options = React.useMemo(
    () =>
      data?.jumpTypes?.map((node) => ({
        label: node?.name || '',
        value: node as JumpTypeEssentialsFragment,
      })) || [],
    [data?.jumpTypes]
  );

  const selected = React.useMemo(
    () => options?.map((option) => option.value).find((node) => node?.id === value?.id),
    [options, value?.id]
  );
  return (
    <Select<JumpTypeEssentialsFragment>
      label="Jump type"
      value={selected}
      options={options}
      onChange={onChange}
    />
  );
}

export const JumpTypeSelectField = withHookForm(JumpTypeSelect);

export default JumpTypeSelect;
