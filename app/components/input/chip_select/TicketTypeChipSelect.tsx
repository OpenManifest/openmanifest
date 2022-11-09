import { TicketTypeEssentialsFragment } from 'app/api/operations';
import { useAllowedTicketTypesQuery } from 'app/api/reflection';
import * as React from 'react';
import { List } from 'react-native-paper';
import { useAppSelector } from '../../../state';
import { withHookForm } from '../withHookForm';
import ChipSelect from './ChipSelect';
import ChipSelectSkeleton from './ChipSelectSkeleton';

interface ITicketTypeSelect {
  value?: TicketTypeEssentialsFragment | null;
  onlyPublicTickets?: boolean;
  error?: string;
  onLoadingStateChanged?(loading: boolean): void;
  onChange(jt: TicketTypeEssentialsFragment): void;
}

function TicketTypeChipSelect(props: ITicketTypeSelect) {
  const { value, onLoadingStateChanged, onChange, onlyPublicTickets, error } = props;
  const { currentDropzoneId } = useAppSelector((root) => root.global);

  const { data, loading } = useAllowedTicketTypesQuery({
    variables: {
      dropzone: currentDropzoneId?.toString() as string,
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
        {...{ error }}
        autoSelectFirst
        items={data?.dropzone?.ticketTypes || []}
        value={[value].filter(Boolean) as TicketTypeEssentialsFragment[]}
        renderItemLabel={(ticketType) => ticketType?.name}
        isDisabled={() => false}
        onChange={([first]) => (first ? onChange(first) : null)}
      />
    </>
  );
}

export const TicketTypeChipSelectField = withHookForm(TicketTypeChipSelect);

export default TicketTypeChipSelect;
