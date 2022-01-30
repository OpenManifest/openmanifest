import { uniqBy } from 'lodash';
import * as React from 'react';
import { Avatar, Chip, List } from 'react-native-paper';
import { Permission } from 'app/api/schema.d';
import { useAppSelector } from 'app/state';
import { useDropzoneUsersQuery } from 'app/api/reflection';
import { DropzoneUserEssentialsFragment } from 'app/api/operations';
import ChipSelect from './ChipSelect';
import ChipSelectSkeleton from './ChipSelectSkeleton';

interface IDropzoneUserChipSelect {
  value?: DropzoneUserEssentialsFragment | null;
  label: string;
  icon?: string;
  requiredPermissions: Permission[];
  onLoadingStateChanged?(loading: boolean): void;
  onSelect(dzuser: DropzoneUserEssentialsFragment): void;
}

export default function DropzoneUserChipSelect(props: IDropzoneUserChipSelect) {
  const { label, requiredPermissions, icon, value, onLoadingStateChanged, onSelect } = props;
  const { currentDropzoneId } = useAppSelector((root) => root.global);

  const { data, loading } = useDropzoneUsersQuery({
    variables: {
      dropzoneId: Number(currentDropzoneId),
      permissions: requiredPermissions,
    },
  });

  React.useEffect(() => {
    onLoadingStateChanged?.(loading);
  }, [loading, onLoadingStateChanged]);

  const onChangeSelected = React.useCallback(
    ([first]) => (first ? onSelect(first) : null),
    [onSelect]
  );
  const getItemLabel = React.useCallback((dzUser) => dzUser?.user.name, []);
  const isSelected = React.useCallback((item) => item.id === value?.id, [value?.id]);
  const selected = React.useMemo(
    () => [value].filter(Boolean) as DropzoneUserEssentialsFragment[],
    [value]
  );

  return loading ? (
    <ChipSelectSkeleton />
  ) : (
    <>
      <List.Subheader>{label}</List.Subheader>
      <ChipSelect<DropzoneUserEssentialsFragment>
        autoSelectFirst
        icon={icon || 'account'}
        items={
          uniqBy(
            data?.dropzone?.dropzoneUsers?.edges?.map((edge) => edge?.node) || [],
            'id'
          ) as DropzoneUserEssentialsFragment[]
        }
        selected={selected}
        isSelected={isSelected}
        renderItemLabel={getItemLabel}
        onChangeSelected={onChangeSelected}
      />
    </>
  );
}
