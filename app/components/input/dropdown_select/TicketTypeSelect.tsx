import * as React from 'react';
import { TicketTypeEssentialsFragment } from 'app/api/operations';
import { useTicketTypesQuery } from 'app/api/reflection';
import { useAppSelector } from 'app/state';
import Select from '../select/Select';

interface ITicketTypeSelect {
  value?: TicketTypeEssentialsFragment | null;
  required?: boolean;
  allowManifestingSelf?: boolean | null;
  onSelect(jt: TicketTypeEssentialsFragment): void;
}

export default function TicketTypeSelect(props: ITicketTypeSelect) {
  const { allowManifestingSelf, value, onSelect } = props;
  const { currentDropzoneId } = useAppSelector((root) => root.global);
  const { data } = useTicketTypesQuery({
    variables: {
      dropzoneId: Number(currentDropzoneId),
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
  return <Select<TicketTypeEssentialsFragment> {...{ value, options }} onChange={onSelect} />;
}
