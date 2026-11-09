import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { DestinationEssentialsFragment } from 'app/api/operations';
import { DestinationKind, Permission } from 'app/api/schema.d';
import { useDestinations } from 'app/api/crud';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import DestinationDialog from 'app/forms/destination/Dialog';
import useRestriction from 'app/hooks/useRestriction';
import useTerms from 'app/i18n/useTerms';
import { formatDestination, formatQuantity } from 'app/i18n/format';
import { useOperatorContext } from 'app/providers/operator/context';
import { destinationsModule } from 'app/utils/destinations';
import { ResourceList, type IconName } from 'app/ui';
import { useRefetchOnFocus, useResourceEditor } from './useResourceEditor';

const ICON: Record<DestinationKind, IconName> = {
  [DestinationKind.Altitude]: 'airplane-takeoff',
  [DestinationKind.Site]: 'map-marker',
  [DestinationKind.Route]: 'map-marker-path',
  [DestinationKind.Section]: 'waves',
};

/** The places the operator's loads go to: altitudes for a skydiving operator, sites for a dive boat, routes for a bus */
export default function DestinationsScreen() {
  const { t } = useTranslation('common');
  const term = useTerms();
  const {
    operator: { operator },
  } = useOperatorContext();
  const { destinations, loading, refetch, archive } = useDestinations();
  useRefetchOnFocus(refetch, !operator?.id);
  const canEdit = useRestriction(Permission.UpdateOperator);
  const kinds = destinationsModule(operator?.modules as Record<string, unknown>)?.kinds ?? [];
  const editor = useResourceEditor<DestinationEssentialsFragment>({
    archive: canEdit ? archive : undefined,
    nameOf: (destination) => destination.name,
  });
  const destinationWord = term('destination').toLowerCase();

  return (
    <ScreenContainer edges={['bottom']} testID="destinations">
      <ResourceList<DestinationEssentialsFragment>
        testID="destinations-list"
        items={destinations}
        loading={loading}
        onRefresh={refetch}
        keyOf={(destination) => destination.id}
        titleOf={(destination) => destination.name}
        iconOf={(destination) => ICON[destination.kind]}
        factsOf={(destination) => [
          destination.kind === DestinationKind.Altitude
            ? {
                label: t('forms.destination.altitude'),
                value: `${formatDestination(destination)} · ${formatQuantity(destination.altitudeM, 'altitude')}`,
              }
            : {
                label: t('forms.destination.kind'),
                value: t(`forms.destination.kinds.${destination.kind}`),
              },
        ]}
        onOpen={canEdit ? editor.openItem : undefined}
        rowTestID={(destination) => `destination-${destination.id}`}
        create={
          canEdit
            ? {
                label: t('forms.destination.newDestination', { destination: destinationWord }),
                onPress: editor.openNew,
                testID: 'new-destination-primary-action',
              }
            : undefined
        }
        empty={{
          icon: 'map-marker-outline',
          title: t('forms.destination.empty', {
            destinations: term('destination', 2).toLowerCase(),
          }),
          body: t('forms.destination.emptyBody'),
        }}
      >
        <DestinationDialog
          open={!!editor.editing}
          original={editor.editing?.original}
          kinds={kinds}
          onClose={editor.close}
          onArchive={editor.onArchive}
        />
      </ResourceList>
    </ScreenContainer>
  );
}
