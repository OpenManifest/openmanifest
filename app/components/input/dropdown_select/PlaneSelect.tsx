import { PlaneEssentialsFragment } from 'app/api/operations';
import { usePlanesQuery } from 'app/api/reflection';
import * as React from 'react';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import Select from '../select/Select';
import { withHookForm } from '../withHookForm';

interface IPlaneSelect {
  value?: PlaneEssentialsFragment | null;
  onCHange(plane: PlaneEssentialsFragment): void;
}
function PlaneSelect(props: IPlaneSelect) {
  const { onCHange, value } = props;
  const { dropzone: currentDropzone } = useDropzoneContext();

  const { data } = usePlanesQuery({
    variables: {
      dropzoneId: currentDropzone?.dropzone?.id?.toString() as string,
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

  return <Select<PlaneEssentialsFragment> value={selected} options={options} onChange={onCHange} />;
}

export const PlaneSelectField = withHookForm(PlaneSelect);

export default PlaneSelect;
