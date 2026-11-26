import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Permission } from 'app/api/schema.d';
import type { VehicleEssentialsFragment } from 'app/api/operations';
import { useVehicles } from 'app/api/crud';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import VehicleDialog from 'app/forms/vehicle/Dialog';
import useRestriction from 'app/hooks/useRestriction';
import useTerms from 'app/i18n/useTerms';
import { useSession } from 'app/state';
import { ResourceList } from 'app/ui';
import { useVehicleGlyphs, vehicleGlyph } from 'app/features/board/VehicleIcon';
import { vehicleFacts } from './lists';
import { useRefetchOnFocus, useResourceEditor } from './useResourceEditor';

/** The vehicles that carry the operator's loads (Setup → Operations, `/configuration/vehicles`) */
export default function VehiclesScreen() {
  const { t } = useTranslation('common');
  const term = useTerms();
  const operatorId = useSession((session) => session.currentOperatorId);
  const variables = React.useMemo(() => ({ operatorId: operatorId?.toString() }), [operatorId]);
  const { vehicles, archive, loading, refetch } = useVehicles(variables);
  useRefetchOnFocus(refetch);
  const canCreate = useRestriction(Permission.CreateVehicle);
  const canUpdate = useRestriction(Permission.UpdateVehicle);
  const canDelete = useRestriction(Permission.DeleteVehicle);
  const editor = useResourceEditor<VehicleEssentialsFragment>({
    archive: canDelete ? archive : undefined,
    nameOf: (vehicle) => vehicle.name ?? vehicle.registration ?? '',
  });
  const vehicleWord = term('vehicle').toLowerCase();
  const glyphs = useVehicleGlyphs();

  return (
    <ScreenContainer edges={['bottom']} testID="vehicles">
      <ResourceList<VehicleEssentialsFragment>
        testID="vehicles-list"
        items={vehicles ?? []}
        loading={loading}
        onRefresh={refetch}
        keyOf={(vehicle) => vehicle.id}
        titleOf={(vehicle) => vehicle.name || vehicle.registration || ''}
        factsOf={(vehicle) => vehicleFacts(vehicle, t)}
        iconOf={(vehicle) => vehicleGlyph(vehicle.kind ?? glyphs.kind)}
        onOpen={canUpdate ? editor.openItem : undefined}
        rowTestID={(vehicle) => `vehicle-${vehicle.id}`}
        create={
          canCreate
            ? {
                label: t('forms.vehicle.newVehicle', { vehicle: vehicleWord }),
                onPress: editor.openNew,
                testID: 'new-vehicle-primary-action',
              }
            : undefined
        }
        empty={{
          icon: glyphs.motion('none'),
          title: t('resources.empty', { items: term('vehicle', 2).toLowerCase() }),
          body: t('resources.vehiclesEmpty', {
            vehicle: vehicleWord,
            loads: term('load', 2).toLowerCase(),
          }),
        }}
      >
        <VehicleDialog
          open={!!editor.editing}
          original={editor.editing?.original ?? undefined}
          onClose={editor.close}
          onArchive={editor.onArchive}
        />
      </ResourceList>
    </ScreenContainer>
  );
}
