import { PlaneEssentialsFragment } from 'app/api/operations';
import { usePlanesQuery } from 'app/api/reflection';
import { uniqBy } from 'lodash';
import * as React from 'react';
import { List } from 'react-native-paper';
import { useAppSelector } from '../../../state';
import ChipSelect from './ChipSelect';
import ChipSelectSkeleton from './ChipSelectSkeleton';

interface IPlaneSelect {
  value?: PlaneEssentialsFragment | null;
  onLoadingStateChanged?(loading: boolean): void;
  onSelect(jt: PlaneEssentialsFragment): void;
}

export default function PlaneChipSelect(props: IPlaneSelect) {
  const { value, onSelect, onLoadingStateChanged } = props;
  const { currentDropzoneId } = useAppSelector((root) => root.global);

  const { data, loading } = usePlanesQuery({
    variables: {
      dropzoneId: Number(currentDropzoneId),
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
        items={uniqBy([...(data?.planes || [])], ({ id }) => id) || []}
        selected={[value].filter(Boolean) as PlaneEssentialsFragment[]}
        renderItemLabel={(plane: PlaneEssentialsFragment) => plane?.name || ''}
        isDisabled={(plane) => false}
        onChangeSelected={([first]) => (first ? onSelect(first as PlaneEssentialsFragment) : null)}
      />
    </>
  );
}
