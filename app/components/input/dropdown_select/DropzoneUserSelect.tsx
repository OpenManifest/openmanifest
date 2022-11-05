import { DropzoneUserEssentialsFragment } from 'app/api/operations';
import { useDropzoneUsersQuery } from 'app/api/reflection';
import * as React from 'react';
import { Title } from 'react-native-paper';
import { DropzoneUser, Permission } from '../../../api/schema.d';
import { useAppSelector } from '../../../state';
import Select from '../select/Select';

interface IDropzoneUserSelect {
  requiredPermissions: Permission[];
  value: DropzoneUser | null;
  label: string;
  onSelect(dzUser: DropzoneUser): void;
}

export default function DropzoneUserSelect(props: IDropzoneUserSelect) {
  const { requiredPermissions, value, onSelect, label } = props;
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
        options={options}
        onChange={onSelect}
      />
    </>
  );
}
