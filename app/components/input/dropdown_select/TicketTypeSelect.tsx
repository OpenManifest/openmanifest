import * as React from 'react';
import { List, Menu } from 'react-native-paper';
import { TicketTypeEssentialsFragment } from 'app/api/operations';
import { useTicketTypesQuery } from 'app/api/reflection';
import { useAppSelector } from 'app/state';

interface ITicketTypeSelect {
  value?: TicketTypeEssentialsFragment | null;
  required?: boolean;
  allowManifestingSelf?: boolean | null;
  onSelect(jt: TicketTypeEssentialsFragment): void;
}

export default function TicketTypeSelect(props: ITicketTypeSelect) {
  const { allowManifestingSelf, value, required } = props;
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const { currentDropzoneId } = useAppSelector((root) => root.global);
  const { data } = useTicketTypesQuery({
    variables: {
      dropzoneId: Number(currentDropzoneId),
      allowManifestingSelf,
    },
  });

  return (
    <>
      <List.Subheader>Ticket</List.Subheader>
      <Menu
        onDismiss={() => setMenuOpen(false)}
        visible={isMenuOpen}
        anchor={
          <List.Item
            onPress={() => {
              setMenuOpen(true);
            }}
            title={value?.name || 'Please select ticket type'}
            description={!required ? 'Optional' : null}
          />
        }
      >
        {data?.ticketTypes?.map((ticketType) => (
          <Menu.Item
            key={`ticket-type-select-${ticketType.id}`}
            onPress={() => {
              setMenuOpen(false);
              props.onSelect(ticketType);
            }}
            title={ticketType.name || '-'}
          />
        ))}
      </Menu>
    </>
  );
}
