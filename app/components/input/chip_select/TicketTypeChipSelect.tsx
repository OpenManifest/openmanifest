import gql from 'graphql-tag';
import * as React from 'react';
import { List } from 'react-native-paper';
import { createQuery } from '../../../api/createQuery';
import { TicketType } from '../../../api/schema.d';
import { useAppSelector } from '../../../state';
import ChipSelect from './ChipSelect';
import ChipSelectSkeleton from './ChipSelectSkeleton';

interface ITicketTypeSelect {
  value?: TicketType | null;
  onlyPublicTickets?: boolean;
  onLoadingStateChanged?(loading: boolean): void;
  onSelect(jt: TicketType): void;
}

export const QUERY_DROPZONE_USERS_ALLOWED_TICKET_TYPES = gql`
  query DropzoneUsersAllowedTicketTypes($dropzoneId: Int!, $onlyPublicTickets: Boolean) {
    dropzone(id: $dropzoneId) {
      id

      ticketTypes(isPublic: $onlyPublicTickets) {
        id
        name
        cost
        isTandem

        extras {
          id
          cost
          name
        }
      }
    }
  }
`;

const useTicketTypes = createQuery<
  { ticketTypes: TicketType[] },
  {
    dropzoneId: number;
    onlyPublicTickets?: boolean | null;
  }
>(QUERY_DROPZONE_USERS_ALLOWED_TICKET_TYPES, {
  getPayload: (query) => ({
    ticketTypes: query?.dropzone?.ticketTypes || [],
  }),
});

export default function TicketTypeChipSelect(props: ITicketTypeSelect) {
  const { value, onLoadingStateChanged, onSelect, onlyPublicTickets } = props;
  const { currentDropzoneId } = useAppSelector((root) => root.global);

  const { data, loading } = useTicketTypes({
    variables: {
      dropzoneId: Number(currentDropzoneId),
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
      <ChipSelect
        autoSelectFirst
        items={data?.ticketTypes || []}
        selected={[value].filter(Boolean) as TicketType[]}
        renderItemLabel={(ticketType) => ticketType?.name}
        isDisabled={() => false}
        onChangeSelected={([first]) => (first ? onSelect(first) : null)}
      />
    </>
  );
}
