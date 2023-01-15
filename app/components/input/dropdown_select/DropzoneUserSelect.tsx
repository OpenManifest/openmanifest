import { DropzoneUserEssentialsFragment } from 'app/api/operations';
import { useDropzoneUsersQuery } from 'app/api/reflection';
import * as React from 'react';
import { Title } from 'react-native-paper';
import { DropzoneUser, Permission } from '../../../api/schema.d';
import { useAppSelector } from '../../../state';
import Select from '../select/Select';
import { withHookForm } from '../withHookForm';

interface IDropzoneUserSelect {
  requiredPermissions?: Permission[];
  value: DropzoneUser | null;
  label: string;
  onChange(dzUser: DropzoneUser): void;
}

function DropzoneUserSelect(props: IDropzoneUserSelect) {
  const { requiredPermissions, value, onChange, label } = props;
  const globalState = useAppSelector((root) => root.global);

  const { data } = useDropzoneUsersQuery({
    variables: {
      dropzoneId: globalState.currentDropzoneId?.toString() as string,
      permissions: requiredPermissions,
    },
  });
  const options = React.useMemo(
    () =>
      data?.dropzoneUsers?.edges
        ?.filter((edge) => !!edge?.node)
        .map((edge) => ({
          label: edge?.node?.user?.name || '',
          value: edge?.node as DropzoneUserEssentialsFragment,
          avatar: edge?.node?.user?.image,
        })) || [],
    [data?.dropzoneUsers?.edges]
  );

  const selected = React.useMemo(
    () =>
      data?.dropzoneUsers?.edges?.map((edge) => edge?.node).find((node) => node?.id === value?.id),
    [data?.dropzoneUsers?.edges, value?.id]
  );

  return (
    <>
      <Title>{label}</Title>
      <Select<DropzoneUserEssentialsFragment>
        value={selected}
        compare={(a, b) => a?.id === b?.id}
        options={options}
        onChange={onChange}
      />
    </>
  );
}

export const DropzoneUserSelectField = withHookForm(DropzoneUserSelect);

export default DropzoneUserSelect;
