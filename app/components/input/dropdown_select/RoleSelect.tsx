import { RoleEssentialsFragment } from 'app/api/operations';
import { useRolesQuery } from 'app/api/reflection';
import * as React from 'react';
import { useAppSelector } from '../../../state';
import Select from '../select/Select';

interface IRoleSelect {
  value?: RoleEssentialsFragment | null;
  disabled?: boolean;
  onSelect(jt: RoleEssentialsFragment): void;
}

export default function RoleSelect(props: IRoleSelect) {
  const { onSelect, value } = props;
  const { currentDropzoneId } = useAppSelector((root) => root.global);
  const { data } = useRolesQuery({
    variables: {
      dropzoneId: Number(currentDropzoneId),
      selectable: true,
    },
  });

  const options = React.useMemo(
    () =>
      data?.dropzone?.roles?.map((node) => ({
        label: node?.name || '',
        value: node as RoleEssentialsFragment,
      })) || [],
    [data?.dropzone?.roles]
  );

  return (
    <Select<RoleEssentialsFragment>
      label="Access level"
      {...{ options, value }}
      onChange={onSelect}
    />
  );
}
