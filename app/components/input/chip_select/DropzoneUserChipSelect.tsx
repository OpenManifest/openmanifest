import { uniqBy } from 'lodash';
import * as React from 'react';
import { List } from 'react-native-paper';
import { Permission } from 'app/api/schema.d';
import { useAppSelector } from 'app/state';
import { useDropzoneUsersQuery } from 'app/api/reflection';
import { DropzoneUserEssentialsFragment } from 'app/api/operations';
import { ChipProps } from 'app/components/chips/Chip';
import ChipSelect from './ChipSelect';
import type { IChipSelect } from './ChipSelect';
import ChipSelectSkeleton from './ChipSelectSkeleton';
import { withHookForm } from '../withHookForm';

interface IDropzoneUserChipSelect extends Pick<IChipSelect<unknown>, 'variant' | 'error'> {
  value?: DropzoneUserEssentialsFragment | null;
  label: string;
  icon?: ChipProps['icon'];
  requiredPermissions: Permission[];
  onLoadingStateChanged?(loading: boolean): void;
  onChange(dzuser: DropzoneUserEssentialsFragment): void;
}

function DropzoneUserChipSelect(props: IDropzoneUserChipSelect) {
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
  const { currentDropzoneId } = useAppSelector((root) => root.global);

  const { data, loading } = useDropzoneUsersQuery({
    variables: {
      dropzoneId: currentDropzoneId?.toString() as string,
      permissions: requiredPermissions,
    },
  });

  React.useEffect(() => {
    onLoadingStateChanged?.(loading);
  }, [loading, onLoadingStateChanged]);

  const onChangeSelected = React.useCallback(
    ([first]: DropzoneUserEssentialsFragment[]) => (first ? onChange(first) : null),
    [onChange]
  );
  const getItemLabel = React.useCallback(
    (dzUser: DropzoneUserEssentialsFragment) => dzUser?.user.name,
    []
  );
  const isSelected = React.useCallback(
    (item: DropzoneUserEssentialsFragment) => item.id === value?.id,
    [value?.id]
  );
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
        {...{ error, variant }}
        autoSelectFirst
        icon={icon || 'account'}
        items={
          uniqBy(
            data?.dropzoneUsers?.edges?.map((edge) => edge?.node) || [],
            'id'
          ) as DropzoneUserEssentialsFragment[]
        }
        value={selected}
        isSelected={isSelected}
        renderItemLabel={getItemLabel}
        onChange={onChangeSelected}
      />
    </>
  );
}

export const DropzoneUserChipSelectField = withHookForm(DropzoneUserChipSelect);

export default DropzoneUserChipSelect;
