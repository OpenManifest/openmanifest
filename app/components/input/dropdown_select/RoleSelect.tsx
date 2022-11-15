import { RoleEssentialsFragment } from 'app/api/operations';
import { useRolesQuery } from 'app/api/reflection';
import startCase from 'lodash/startCase';
import * as React from 'react';
import { useAppSelector } from '../../../state';
import Select from '../select/Select';
import { withHookForm } from '../withHookForm';

interface IRoleSelect {
  value?: RoleEssentialsFragment | null;
  disabled?: boolean;
  onChange(jt: RoleEssentialsFragment): void;
}

function RoleSelect(props: IRoleSelect) {
  const { onChange, value } = props;
  const { currentDropzoneId } = useAppSelector((root) => root.global);
  const { data } = useRolesQuery({
    variables: {
      dropzoneId: currentDropzoneId?.toString() as string,
    },
  });

  const options = React.useMemo(
    () =>
      data?.dropzone?.roles?.map(({ permissions, ...node }) => ({
        label: startCase(node?.name || ''),
        value: node,
      })) || [],
    [data?.dropzone?.roles]
  );

  return (
    <Select<RoleEssentialsFragment>
      label="Access level"
      compare={(a, b) => a?.id === b?.id}
      {...{ options, value, onChange }}
      onChange={onChange}
    />
  );
}

export const RoleSelectField = withHookForm(RoleSelect);

export default RoleSelect;
