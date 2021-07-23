import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import * as React from "react";
import { List, Menu } from "react-native-paper";
import useCurrentDropzone from "../../../api/hooks/useCurrentDropzone";
import { TicketType, Query } from "../../../api/schema.d";
import { useAppSelector } from "../../../state";


interface ITicketTypeSelect {
  value?: TicketType | null;
  required?: boolean;
  allowManifestingSelf?: boolean | null;
  onSelect(jt: TicketType): void;
}

const QUERY_TICKET_TYPES = gql`
  query TicketTypes($allowManifestingSelf: Boolean, $dropzoneId: Int!) {
    ticketTypes(allowManifestingSelf: $allowManifestingSelf, dropzoneId: $dropzoneId) {
      id
      name
      isTandem
      cost

      extras {
        id
        name
        cost
      }
    }
  }
`;

export default function TicketTypeSelect(props: ITicketTypeSelect) {
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const { currentDropzoneId } = useAppSelector(state => state.global);
;
  const { data, loading, refetch } = useQuery<Query>(QUERY_TICKET_TYPES, {
    variables: {
      dropzoneId: Number(currentDropzoneId),
      allowManifestingSelf: props.allowManifestingSelf,
    }
  });

  
  return (
    <>
      <List.Subheader>
        Ticket
      </List.Subheader>
      <Menu
        onDismiss={() => setMenuOpen(false)}
        visible={isMenuOpen}
        anchor={
          <List.Item
            onPress={() => {
              setMenuOpen(true);
            }}
            title={
              props.value?.name || "Please select ticket type"
            }
            description={!props.required ? "Optional" : null}
          />
        }>
        {
          data?.ticketTypes?.map((ticketType) => 
            <Menu.Item
              key={`ticket-type-select-${ticketType.id}`}
              onPress={() => {
                setMenuOpen(false);
                props.onSelect(ticketType);
              }}
              title={
                ticketType.name || "-"
              }
            />
          )
        }
      </Menu>
    </>
  )
}