import * as React from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DestinationEssentialsFragment } from 'app/api/operations';
import { DestinationKind, Permission } from 'app/api/schema.d';
import { useDestinations } from 'app/api/crud';
import DestinationDialog from 'app/forms/destination/Dialog';
import useRestriction from 'app/hooks/useRestriction';
import useTerms from 'app/i18n/useTerms';
import { formatDestination, formatQuantity } from 'app/i18n/format';
import { useNotifications } from 'app/providers/notifications';
import { useOperatorContext } from 'app/providers/operator/context';
import { destinationsModule } from 'app/utils/destinations';
import {
  Button,
  EmptyState,
  Icon,
  IconButton,
  ListRow,
  Row,
  Skeleton,
  Stack,
  useStyles,
  type IconName,
} from 'app/ui';

const ICON: Record<DestinationKind, IconName> = {
  [DestinationKind.Altitude]: 'airplane-takeoff',
  [DestinationKind.Site]: 'map-marker',
  [DestinationKind.Route]: 'map-marker-path',
  [DestinationKind.Section]: 'waves',
};

/** The places the operator's loads go to: altitudes for a dropzone, sites for a dive boat, routes for a bus */
export default function DestinationsScreen() {
  const { t } = useTranslation('common');
  const term = useTerms();
  const notify = useNotifications();
  const {
    operator: { operator },
  } = useOperatorContext();
  const { destinations, loading, refetch, archive } = useDestinations();
  const canEdit = useRestriction(Permission.UpdateOperator);
  const kinds = destinationsModule(operator?.modules as Record<string, unknown>)?.kinds ?? [];
  const [editing, setEditing] = React.useState<{
    original: DestinationEssentialsFragment | null;
  } | null>(null);
  const styles = useStyles((theme) => ({
    content: { padding: theme.space.lg, gap: theme.space.lg, flexGrow: 1 },
  }));

  const onArchive = async (destination: DestinationEssentialsFragment) => {
    const response = await archive(destination);
    if ('error' in response && response.error) {
      notify.error(response.error);
    } else {
      notify.success(t('forms.destination.archived', { name: destination.name }));
    }
  };

  const destinationWord = term('destination').toLowerCase();
  const newLabel = t('forms.destination.newDestination', { destination: destinationWord });
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
    >
      {loading && !destinations.length ? <Skeleton height={64} /> : null}
      {!loading && !destinations.length ? (
        <EmptyState
          testID="destinations-empty"
          icon="map-marker-outline"
          title={t('forms.destination.empty', {
            destinations: term('destination', 2).toLowerCase(),
          })}
          body={t('forms.destination.emptyBody')}
          action={
            canEdit ? { label: newLabel, onPress: () => setEditing({ original: null }) } : undefined
          }
        />
      ) : null}
      {destinations.length ? (
        <Stack gap="xs" testID="destinations-list">
          {destinations.map((destination) => (
            <Row key={destination.id} align="center" gap="xs">
              <Stack flex>
                <ListRow
                  testID={`destination-${destination.id}`}
                  leading={<Icon name={ICON[destination.kind]} />}
                  title={destination.name}
                  supporting={
                    destination.kind === DestinationKind.Altitude
                      ? `${formatDestination(destination)} · ${formatQuantity(destination.altitudeM, 'altitude')}`
                      : t(`forms.destination.kinds.${destination.kind}`)
                  }
                  onPress={canEdit ? () => setEditing({ original: destination }) : undefined}
                />
              </Stack>
              {canEdit ? (
                <IconButton
                  icon="archive-outline"
                  aria-label={t('forms.destination.archive', { name: destination.name })}
                  onPress={() => onArchive(destination)}
                />
              ) : null}
            </Row>
          ))}
        </Stack>
      ) : null}
      {canEdit && destinations.length ? (
        <Button
          label={newLabel}
          variant="secondary"
          testID="new-destination-primary-action"
          onPress={() => setEditing({ original: null })}
        />
      ) : null}
      <DestinationDialog
        open={!!editing}
        original={editing?.original}
        kinds={kinds}
        onClose={() => setEditing(null)}
      />
    </ScrollView>
  );
}
