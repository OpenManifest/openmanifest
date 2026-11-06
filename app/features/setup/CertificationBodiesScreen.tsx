import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Permission } from 'app/api/schema.d';
import type { CertificationBodyEssentialsFragment } from 'app/api/operations';
import { useCertificationBodiesQuery } from 'app/api/reflection';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import useRestriction from 'app/hooks/useRestriction';
import useTerms from 'app/i18n/useTerms';
import { useNotifications } from 'app/providers/notifications';
import { useOperatorContext } from 'app/providers/operator/context';
import { ResourceForm, ResourceList, Select, Stack, Text } from 'app/ui';
import { bodiesToAdd } from './lists';

/**
 * The certification bodies whose levels and qualifications the operator accepts (Setup → People and access,
 * `/configuration/certification-bodies`). Adding one is choosing it from the bodies of the operator's industry; an
 * operator with the certifications module keeps at least one.
 */
export default function CertificationBodiesScreen() {
  const { t } = useTranslation('common');
  const term = useTerms();
  const notify = useNotifications();
  const {
    operator: { operator, update },
  } = useOperatorContext();
  const { data, loading } = useCertificationBodiesQuery();
  const canEdit = useRestriction(Permission.UpdateOperator);
  const accepted = React.useMemo(
    () => operator?.certificationBodies ?? [],
    [operator?.certificationBodies]
  );
  const available = bodiesToAdd(data?.certificationBodies ?? [], accepted, operator?.industry);
  const keepsOne =
    'certifications' in ((operator?.modules as Record<string, unknown> | null) ?? {}) &&
    accepted.length <= 1;

  const [adding, setAdding] = React.useState(false);
  const [chosen, setChosen] = React.useState<string | null>(null);
  const [viewing, setViewing] = React.useState<CertificationBodyEssentialsFragment | null>(null);
  const [saving, setSaving] = React.useState(false);
  const bodies = term('certification_body', 2).toLowerCase();

  const save = async (ids: string[], message: string) => {
    setSaving(true);
    const response = await update({
      name: operator?.name ?? '',
      certificationBodyIds: ids.map(Number),
    });
    setSaving(false);
    if ('error' in response && response.error) {
      notify.error(response.error);
      return false;
    }
    notify.success(message);
    return true;
  };

  const add = async () => {
    const body = available.find((candidate) => candidate.id === chosen);
    if (!body) return;
    const done = await save(
      [...accepted.map(({ id }) => id), body.id],
      t('resources.bodyAdded', { name: body.name })
    );
    if (done) setAdding(false);
  };
  const remove = async () => {
    if (!viewing) return;
    const done = await save(
      accepted.filter(({ id }) => id !== viewing.id).map(({ id }) => id),
      t('resources.bodyRemoved', { name: viewing.name })
    );
    if (done) setViewing(null);
  };

  return (
    <ScreenContainer edges={['bottom']} testID="certification-bodies">
      <ResourceList<CertificationBodyEssentialsFragment>
        testID="certification-bodies-list"
        intro={t('resources.bodiesIntro', { bodies })}
        items={accepted}
        loading={loading && !operator}
        keyOf={(body) => body.id}
        titleOf={(body) => body.name ?? ''}
        factsOf={(body) => [
          {
            label: t('resources.facts.verification'),
            value: body.verificationProvider
              ? body.verificationProvider.toUpperCase()
              : t('resources.facts.byStaff'),
          },
        ]}
        iconOf={() => 'certificate-outline'}
        onOpen={setViewing}
        rowTestID={(body) => `certification-body-${body.slug}`}
        create={
          canEdit && available.length
            ? {
                label: t('resources.addBody'),
                onPress: () => {
                  setChosen(available[0]?.id ?? null);
                  setAdding(true);
                },
                testID: 'add-certification-body-primary-action',
              }
            : undefined
        }
        empty={{
          icon: 'certificate-outline',
          title: t('resources.empty', { items: bodies }),
          body: t('resources.bodiesEmpty', { bodies }),
        }}
      >
        <ResourceForm
          open={adding}
          onClose={() => setAdding(false)}
          title={t('resources.addBody')}
          loading={saving}
          submitLabel={t('resources.accept')}
          onSubmit={chosen ? add : undefined}
        >
          <Select
            label={term('certification_body')}
            options={available.map((body) => ({ value: body.id, label: body.name ?? body.id }))}
            value={chosen}
            onChange={setChosen}
          />
        </ResourceForm>
        <ResourceForm
          open={!!viewing}
          onClose={() => setViewing(null)}
          title={viewing?.name ?? ''}
          loading={saving}
          archiveLabel={t('resources.stopAccepting')}
          onArchive={canEdit && !keepsOne ? remove : undefined}
        >
          <Stack gap="sm">
            <Text>{t('resources.bodyAccepted', { name: viewing?.name ?? '' })}</Text>
            {canEdit && keepsOne ? (
              <Text tone="muted">{t('resources.keepsOneBody', { bodies })}</Text>
            ) : null}
          </Stack>
        </ResourceForm>
      </ResourceList>
    </ScreenContainer>
  );
}
