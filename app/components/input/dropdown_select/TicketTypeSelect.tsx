import * as React from 'react';
import { TicketTypeEssentialsFragment } from 'app/api/operations';
import { useTicketTypesQuery } from 'app/api/reflection';
import { useAppSelector } from 'app/state';
import Select from '../select/Select';
import { withHookForm } from '../withHookForm';

interface ITicketTypeSelect {
  value?: TicketTypeEssentialsFragment | null;
  required?: boolean;
  allowManifestingSelf?: boolean | null;
  onChange(jt: TicketTypeEssentialsFragment): void;
}

function TicketTypeSelect(props: ITicketTypeSelect) {
  const { allowManifestingSelf, value, onChange } = props;
  const { currentDropzoneId } = useAppSelector((root) => root.global);
  const { data } = useTicketTypesQuery({
    variables: {
      dropzone: currentDropzoneId?.toString() as string,
      allowManifestingSelf,
    },
  });

  const options = React.useMemo(
    () =>
      data?.ticketTypes?.map((node) => ({
        label: node?.name || '',
        value: node as TicketTypeEssentialsFragment,
      })) || [],
    [data?.ticketTypes]
  );
  return <Select<TicketTypeEssentialsFragment> {...{ value, options, onChange }} />;
}

export const TicketTypeSelectField = withHookForm(TicketTypeSelect);

export default TicketTypeSelect;
