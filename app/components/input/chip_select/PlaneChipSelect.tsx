import { PlaneEssentialsFragment } from 'app/api/operations';
import { usePlanesQuery } from 'app/api/reflection';
import { uniqBy } from 'lodash';
import * as React from 'react';
import { List } from 'react-native-paper';
import { useAppSelector } from '../../../state';
import { withHookForm } from '../withHookForm';
import ChipSelect from './ChipSelect';
import ChipSelectSkeleton from './ChipSelectSkeleton';

interface IPlaneSelect {
  value?: PlaneEssentialsFragment | null;
  error?: string | null;
  onLoadingStateChanged?(loading: boolean): void;
  onChange(jt: PlaneEssentialsFragment): void;
}

function PlaneChipSelect(props: IPlaneSelect) {
  const { value, onChange, onLoadingStateChanged, error } = props;
  const { currentDropzoneId } = useAppSelector((root) => root.global);

  const { data, loading } = usePlanesQuery({
    variables: {
      dropzoneId: currentDropzoneId?.toString() as string,
    },
  });

  React.useEffect(() => {
    onLoadingStateChanged?.(loading);
  }, [loading, onLoadingStateChanged]);

  return loading ? (
    <ChipSelectSkeleton />
  ) : (
    <>
      <List.Subheader>Aircraft</List.Subheader>
      <ChipSelect<PlaneEssentialsFragment>
        autoSelectFirst
        {...{ error }}
        items={uniqBy([...(data?.planes || [])], ({ id }) => id) || []}
        value={[value].filter(Boolean) as PlaneEssentialsFragment[]}
        renderItemLabel={(plane: PlaneEssentialsFragment) => plane?.name || ''}
        isDisabled={(plane) => false}
        onChange={([first]) => (first ? onChange(first as PlaneEssentialsFragment) : null)}
      />
    </>
  );
}

export const PlaneChipSelectField = withHookForm(PlaneChipSelect);

export default PlaneChipSelect;
