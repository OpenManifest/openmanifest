import * as React from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { RouteProp, useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { EmptyState, Skeleton, useTheme } from 'app/ui';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import useBreakpoint from 'app/components/layout/useBreakpoint';
import ManifestDeskNote from 'app/components/ManifestDeskNote';
import LoadActions from 'app/features/board/LoadActions';
import { useCrewRolesQuery, useLoadEligibilityQuery } from 'app/api/reflection';
import type { SlotDetailsFragment } from 'app/api/operations';
import {
  LoadContextProvider,
  useLoadContext,
  useManifestContext,
  useOperatorContext,
} from 'app/providers';
import { useNotifications } from 'app/providers/notifications';
import useOpenUser from 'app/navigation/useOpenUser';
import useRestriction from 'app/hooks/useRestriction';
import { Permission } from 'app/api/schema.d';
import { moduleEnabled } from 'app/utils/modules';
import MemberPicker from 'app/features/picker/MemberPicker';
import EscortGroup from './EscortGroup';
import FreePlaces from './FreePlaces';
import LoadHeader from './LoadHeader';
import PlaceRow from './PlaceRow';
import VehicleHeader from './VehicleHeader';
import { buildSections, type SectionItem } from './sections';

const EmbeddedContainer = ({ children }: React.PropsWithChildren<{ edges?: string[] }>) => (
  <View style={{ flex: 1 }}>{children}</View>
);

export type LoadScreenRoute = { LoadScreen: { loadId: string } };

/**
 * The load: its call card, crew, places and actions. `embedded` is for the pane of the board on a tablet: it does not name
 * the screen, and its actions stay in the card.
 */
export function LoadView({ embedded = false }: { embedded?: boolean }) {
  const { t } = useTranslation(['common', 'terms']);
  const theme = useTheme();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const compact = useBreakpoint() === 'compact' && !embedded;
  const notify = useNotifications();
  const openUser = useOpenUser();
  const {
    load: { load, loading, refetch, updateCrew },
  } = useLoadContext();
  const {
    manifest: { deleteSlot, permissions },
    dialogs,
  } = useManifestContext();
  const {
    operator: { operator, currentUser },
  } = useOperatorContext();
  const { data: crewData } = useCrewRolesQuery({
    variables: { operatorId: operator?.id as string },
    skip: !operator?.id,
  });
  const crewRoles = React.useMemo(
    () => crewData?.operator?.crewRoles ?? [],
    [crewData?.operator?.crewRoles]
  );
  const canUpdateLoad = useRestriction(Permission.UpdateLoad);
  const canSeeReadiness = permissions.canManifestOthers;
  const { data: eligibility, refetch: refetchEligibility } = useLoadEligibilityQuery({
    variables: { id: load?.id as string },
    skip: !load?.id || !canSeeReadiness,
    fetchPolicy: 'cache-and-network',
  });
  const placeCount = load?.slots?.length ?? 0;
  React.useEffect(() => {
    if (load?.id && canSeeReadiness) refetchEligibility();
  }, [placeCount, load?.id, canSeeReadiness, refetchEligibility]);
  const rulesByMember = React.useMemo(
    () =>
      new Map(
        (eligibility?.load?.slots ?? []).flatMap(({ membership }) =>
          membership ? [[membership.id, membership.eligibility.rules] as const] : []
        )
      ),
    [eligibility]
  );

  React.useEffect(() => {
    if (!embedded && load?.loadNumber) {
      navigation.setOptions({
        title: t('common:loadNumber', {
          load: t('terms:load', { count: 1 }),
          number: load.loadNumber,
        }),
      });
    }
  }, [embedded, load?.loadNumber, navigation, t]);

  const loadTerm = String(t('terms:load', { count: 1 })).toLowerCase();
  const items = React.useMemo(
    () =>
      load
        ? buildSections(load, {
            notAssigned: t('forms.load.notAssigned', {
              ns: 'common',
              vehicle: String(t('terms:vehicle', { count: 1 })).toLowerCase(),
            }),
          })
        : [],
    [load, t]
  );

  const isOwn = (slot: SlotDetailsFragment) =>
    !!slot.membership?.id && slot.membership.id === currentUser?.id;
  const canEdit = (slot: SlotDetailsFragment) =>
    isOwn(slot) ? permissions.canUpdateOwnSlot : permissions.canUpdateSlot;
  const canTakeOff = (slot: SlotDetailsFragment) =>
    isOwn(slot) ? permissions.canDeleteOwnSlot : permissions.canDeleteSlot;

  const edit = React.useCallback(
    (slot: SlotDetailsFragment) => {
      if (!load) return;
      const group = (load.slots ?? []).filter(
        ({ groupNumber }) => groupNumber && groupNumber === slot.groupNumber
      );
      if (group.length) dialogs.manifestGroup.open({ load, slots: group });
      else dialogs.manifestUser.open({ load, slot });
    },
    [dialogs.manifestGroup, dialogs.manifestUser, load]
  );
  const takeOff = React.useCallback(
    async (slot: SlotDetailsFragment) => {
      const response = await deleteSlot({ id: Number(slot.id) });
      const name = slot.membership?.user?.name ?? '';
      if ('error' in response && response.error) notify.error(response.error);
      else
        notify.info(t('common:load.takenOff', { name, load: loadTerm, number: load?.loadNumber }));
    },
    [deleteSlot, load?.loadNumber, loadTerm, notify, t]
  );
  const [picking, setPicking] = React.useState(false);
  const manifest = React.useCallback(() => setPicking(true), []);
  const canManifest = permissions.canManifestSelf || permissions.canManifestOthers;

  const actions = load ? (
    <LoadActions load={load} crewRoles={crewRoles} testID="load-actions" />
  ) : null;
  const showDestination = !!operator?.modules && moduleEnabled(operator.modules, 'destinations');

  const renderItem = ({ item }: { item: SectionItem }) => {
    switch (item.type) {
      case 'header':
        return (
          <VehicleHeader
            title={item.title}
            kind={item.vehicleKind}
            filled={item.filled}
            capacity={item.capacity}
          />
        );
      case 'free':
        return <FreePlaces count={item.count} onPress={canManifest ? manifest : undefined} />;
      default: {
        const common = {
          slot: item.slot,
          group: item.group,
          rules: item.slot.membership ? rulesByMember.get(item.slot.membership.id) : null,
          canEdit: canEdit(item.slot),
          canTakeOff: canTakeOff(item.slot),
          showDestination,
          onEdit: edit,
          onTakeOff: takeOff,
          onOpenPerson: (slot: SlotDetailsFragment) =>
            slot.membership?.id && openUser('ProfileScreen', { userId: slot.membership.id }),
        };
        return item.slot.guestSlots?.length ? (
          <EscortGroup {...common} />
        ) : (
          <PlaceRow {...common} />
        );
      }
    }
  };

  const Container = embedded ? EmbeddedContainer : ScreenContainer;

  if (!load && !loading) {
    return <EmptyState icon="alert-circle-outline" title={t('common:load.notFound')} />;
  }

  return (
    <Container edges={['bottom']}>
      {load ? (
        <FlatList
          testID="slots"
          data={items}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: theme.space.xs }} />}
          contentContainerStyle={{
            padding: theme.space.lg,
            gap: theme.space.sm,
            paddingBottom: theme.space.xxxl,
          }}
          ListHeaderComponent={
            <View style={{ gap: theme.space.md, paddingBottom: theme.space.md }}>
              <LoadHeader
                load={load}
                crewRoles={crewRoles}
                timeZone={operator?.timeZone}
                onFillRole={canUpdateLoad ? updateCrew : undefined}
                action={compact ? undefined : actions}
              />
              <ManifestDeskNote />
            </View>
          }
          refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refetch()} />}
        />
      ) : (
        <View style={{ padding: theme.space.lg, gap: theme.space.md }}>
          <Skeleton height={200} />
          <Skeleton lines={4} />
        </View>
      )}
      {/* On a phone the actions stay in reach while the places scroll */}
      {compact && load && isFocused ? (
        <View
          testID="load-sticky-actions"
          style={{
            padding: theme.space.md,
            backgroundColor: theme.colour.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colour.border,
          }}
        >
          {actions}
        </View>
      ) : null}
      {load ? <MemberPicker load={load} open={picking} onClose={() => setPicking(false)} /> : null}
    </Container>
  );
}

export default function LoadScreen() {
  const route = useRoute<RouteProp<LoadScreenRoute>>();
  return (
    <LoadContextProvider id={route?.params?.loadId}>
      <LoadView />
    </LoadContextProvider>
  );
}
