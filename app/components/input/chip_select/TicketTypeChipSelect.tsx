import gql from "graphql-tag";
import * as React from "react";
import { List } from "react-native-paper";
import { createQuery } from "../../../graphql/createQuery";
import useCurrentDropzone from "../../../graphql/hooks/useCurrentDropzone";
import { TicketType } from "../../../graphql/schema.d";
import { useAppSelector } from "../../../redux";
import ChipSelect from "./ChipSelect";


interface ITicketTypeSelect {
  value?: TicketType | null;
  required?: boolean;
  onlyPublicTickets?: boolean;
  onSelect(jt: TicketType): void;
}

export const QUERY_DROPZONE_USERS_ALLOWED_TICKET_TYPES = gql`
query DropzoneUsersAllowedTicketTypes(
  $dropzoneId: Int!,
  $onlyPublicTickets: Boolean
) {
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

const useTicketTypes = createQuery<{ ticketTypes: TicketType[] }, {
  dropzoneId: number,
  onlyPublicTickets?: boolean | null
 }>(QUERY_DROPZONE_USERS_ALLOWED_TICKET_TYPES, {
   getPayload: (query) => ({
     ticketTypes: query?.dropzone?.ticketTypes || [],
   })
 });

export default function TicketTypeChipSelect(props: ITicketTypeSelect) {
  const { currentDropzoneId } = useAppSelector(state => state.global);
  
  const { data, loading } = useTicketTypes({
    variables: {
      dropzoneId: Number(currentDropzoneId),
      onlyPublicTickets: props.onlyPublicTickets || null,
    },
    onError: console.error
  });

  return (
    <>
      <List.Subheader>
        Ticket
      </List.Subheader>
      <ChipSelect
        autoSelectFirst
        items={data?.ticketTypes || []}
        selected={[props.value].filter(Boolean)}
        renderItemLabel={(ticketType) => ticketType?.name}
        isDisabled={() => false}
        onChangeSelected={([first]) =>
          first ? props.onSelect(first) : null
        }
      />
    </>
  )
}