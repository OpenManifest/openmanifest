import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { DestinationEssentialsFragment } from 'app/api/operations';
import { DestinationKind } from 'app/api/schema.d';
import { ResourceForm } from 'app/ui';
import useTerms from 'app/i18n/useTerms';
import { activeUnits } from 'app/i18n/operatorFormat';
import { fromSi, unitOf } from 'app/i18n/units';
import { useCertificationLevelsQuery } from 'app/api/reflection';
import { useOperatorContext } from 'app/providers/operator/context';
import { moduleEnabled } from 'app/utils/modules';
import DestinationForm from './DestinationForm';
import { rankOptions } from './ranks';
import useForm from './useForm';

export interface IDestinationDialogProps {
  open: boolean;
  /** The destination being edited; none for a new one */
  original?: DestinationEssentialsFragment | null;
  /** The kinds the operator may create */
  kinds: DestinationKind[];
  onClose(): void;
  /** Archives the item being edited (a setup list passes it; elsewhere the form only saves) */
  onArchive?(): void;
}

/** The deepest point of a site, in the operator's depth unit */
function depthOf(location: unknown): number | undefined {
  const metres = (location as { max_depth_m?: unknown } | null)?.max_depth_m;
  return typeof metres === 'number'
    ? Math.round(fromSi('depth', metres, unitOf('depth', activeUnits())))
    : undefined;
}

export default function DestinationDialog({
  open,
  original,
  kinds,
  onClose,
  onArchive,
}: IDestinationDialogProps) {
  const { t } = useTranslation('common');
  const term = useTerms();
  const {
    operator: { operator },
  } = useOperatorContext();
  const certifications = moduleEnabled(operator?.modules, 'certifications');
  const { data: levels } = useCertificationLevelsQuery({ skip: !open || !certifications });
  const ranks = React.useMemo(
    () =>
      certifications
        ? rankOptions(
            levels?.certificationLevels ?? [],
            (operator?.certificationBodies ?? []).map(({ id }) => id)
          )
        : [],
    [certifications, levels?.certificationLevels, operator?.certificationBodies]
  );
  const initial = React.useMemo(
    () => ({
      id: original?.id,
      name: original?.name,
      kind: original?.kind ?? kinds[0],
      altitude:
        original?.altitudeM == null
          ? undefined
          : Math.round(fromSi('altitude', original.altitudeM, unitOf('altitude', activeUnits()))),
      maxDepth: depthOf(original?.location),
      minCertificationRank:
        original?.minCertificationRank == null ? '' : String(original.minCertificationRank),
    }),
    [original, kinds]
  );
  const { control, loading, onSubmit, reset } = useForm({
    initial,
    location: original?.location,
    onSuccess: onClose,
  });

  React.useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const destination = term('destination').toLowerCase();
  return (
    <ResourceForm
      onArchive={onArchive}
      {...{ open, loading, onClose }}
      title={
        original?.id
          ? t('forms.destination.editDestination', { destination })
          : t('forms.destination.newDestination', { destination })
      }
      onSubmit={onSubmit}
    >
      <DestinationForm {...{ control, kinds, ranks }} />
    </ResourceForm>
  );
}
