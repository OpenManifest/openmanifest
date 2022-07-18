import { TicketTypeEssentialsFragment } from 'app/api/operations';
import { useAllowedTicketTypesQuery } from 'app/api/reflection';
import * as React from 'react';
import { List } from 'react-native-paper';
import { useAppSelector } from '../../../state';
import ChipSelect from './ChipSelect';
import ChipSelectSkeleton from './ChipSelectSkeleton';

interface ITicketTypeSelect {
  value?: TicketTypeEssentialsFragment | null;
  onlyPublicTickets?: boolean;
  onLoadingStateChanged?(loading: boolean): void;
  onSelect(jt: TicketTypeEssentialsFragment): void;
}

export default function TicketTypeChipSelect(props: ITicketTypeSelect) {
  const { value, onLoadingStateChanged, onSelect, onlyPublicTickets } = props;
  const { currentDropzoneId } = useAppSelector((root) => root.global);

  const { data, loading } = useAllowedTicketTypesQuery({
    variables: {
      dropzone: Number(currentDropzoneId),
      onlyPublicTickets: onlyPublicTickets || null,
    },
    onError: console.error,
  });

  React.useEffect(() => {
    onLoadingStateChanged?.(loading);
  }, [loading, onLoadingStateChanged]);

  return loading ? (
    <ChipSelectSkeleton />
  ) : (
    <>
      <List.Subheader>Ticket</List.Subheader>
      <ChipSelect<TicketTypeEssentialsFragment>
        autoSelectFirst
        items={data?.dropzone?.ticketTypes || []}
        selected={[value].filter(Boolean) as TicketTypeEssentialsFragment[]}
        renderItemLabel={(ticketType) => ticketType?.name}
        isDisabled={() => false}
        onChangeSelected={([first]) => (first ? onSelect(first) : null)}
      />
    </>
  );
}
