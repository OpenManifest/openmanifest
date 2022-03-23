import { PlaneEssentialsFragment } from 'app/api/operations';
import { usePlanesQuery } from 'app/api/reflection';
import * as React from 'react';
import useCurrentDropzone from 'app/api/hooks/useCurrentDropzone';
import Select from '../select/Select';

interface IPlaneSelect {
  value?: PlaneEssentialsFragment | null;
  onSelect(plane: PlaneEssentialsFragment): void;
}
export default function PlaneSelect(props: IPlaneSelect) {
  const { onSelect, value } = props;
  const currentDropzone = useCurrentDropzone();

  const { data } = usePlanesQuery({
    variables: {
      dropzoneId: Number(currentDropzone?.dropzone?.id),
    },
  });

  const selected = React.useMemo(
    () => data?.planes?.find((node) => node?.id === value?.id),
    [data?.planes, value?.id]
  );
  const options = React.useMemo(
    () =>
      data?.planes?.map((node) => ({
        label: node?.name || '',
        value: node as PlaneEssentialsFragment,
      })) || [],
    [data?.planes]
  );

  return <Select<PlaneEssentialsFragment> value={selected} options={options} onChange={onSelect} />;
}
