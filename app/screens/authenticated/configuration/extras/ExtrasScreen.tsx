import * as React from 'react';
import { FAB, DataTable } from 'react-native-paper';
import ProgressBar from 'app/components/ProgressBar';
import { useTicketTypeExtrasQuery } from 'app/api/reflection';
import { Permission } from 'app/api/schema.d';

import NoResults from 'app/components/NoResults';
import FloatingActionArea from 'app/components/layout/FloatingActionArea';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import useRestriction from 'app/hooks/useRestriction';
import { TicketTypeAddonDetailsFragment } from 'app/api/operations';
import { useAppTheme } from 'app/theme';
import { CHROME_MAX_FONT_SIZE_MULTIPLIER } from 'app/components/layout/fontScale';

export default function ExtrasScreen() {
  const { dropzone: currentDropzone, dialogs } = useDropzoneContext();
  const { theme } = useAppTheme();
  const { data, loading } = useTicketTypeExtrasQuery({
    variables: {
      dropzoneId: currentDropzone?.dropzone?.id as string,
    },
  });
  const createEditHandler = React.useCallback(
    (ticketTypeAddon: TicketTypeAddonDetailsFragment) => () =>
      dialogs.ticketTypeAddon.open({ original: ticketTypeAddon }),
    [dialogs.ticketTypeAddon]
  );
  const canCreateExtras = useRestriction(Permission.CreateExtra);

  return (
    <ScreenContainer edges={['bottom']}>
      <ProgressBar visible={loading} indeterminate color={theme.colors.primary} />
      <ScrollableScreen hasFab contentContainerStyle={{ backgroundColor: theme.colors.surface }}>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Name</DataTable.Title>
            <DataTable.Title numeric>Cost</DataTable.Title>
          </DataTable.Header>

          {data?.extras?.map((extra) => (
            <DataTable.Row
              key={`extra-${extra.id}`}
              onPress={createEditHandler(extra)}
              pointerEvents="none"
            >
              <DataTable.Cell>{extra.name}</DataTable.Cell>
              <DataTable.Cell numeric>${extra.cost}</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
        {!loading && !data?.extras?.length && (
          <NoResults
            title="No ticket addons"
            subtitle="You can add multiple addons to assign to tickets, e.g outside camera, or coach"
          />
        )}
      </ScrollableScreen>
      <FloatingActionArea>
        <FAB
          labelMaxFontSizeMultiplier={CHROME_MAX_FONT_SIZE_MULTIPLIER}
          testID="new-ticket-addon-primary-action"
          style={{ backgroundColor: theme.colors.primary }}
          visible={canCreateExtras}
          small
          icon="plus"
          onPress={() => dialogs.ticketTypeAddon.open()}
          label="New ticket addon"
        />
      </FloatingActionArea>
    </ScreenContainer>
  );
}
