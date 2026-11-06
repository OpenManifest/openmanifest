import * as React from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useProfileQuery, useUpdateEquipmentMutation } from 'app/api/reflection';
import useImagePicker from 'app/hooks/useImagePicker';
import useOpenUser from 'app/navigation/useOpenUser';
import { useOperatorContext } from 'app/providers';
import { useNotifications } from 'app/providers/notifications';
import { useImageViewer } from 'app/components/dialogs/ImageViewer/context';
import { useTranslation } from 'react-i18next';
import { abilitiesOf, type ProfileEquipment } from './profile';

/** How many of the member's loads a profile shows at first, and how many more "Show older" adds */
export const SLOTS_PAGE = 20;

/**
 * A member's profile from the `Profile` query, asked again when the screen comes back into view (after an inspection,
 * the guided form) and when the member's credit changes in the cache (the credits sheet writes it; whether the credit is
 * enough is the server's to say). With the viewer's abilities on it.
 */
export default function useProfile(id?: string | null) {
  const isFocused = useIsFocused();
  const [slots, setSlots] = React.useState(SLOTS_PAGE);
  const {
    operator: { currentUser, permissions },
  } = useOperatorContext();
  const {
    data: fresh,
    previousData,
    loading,
    refetch,
  } = useProfileQuery({
    variables: { id: id as string, slots },
    skip: !id,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  // While "Show older" asks for more, the loads already shown stay
  const data = fresh ?? (previousData?.membership?.id === id ? previousData : undefined);
  const profile = data?.membership ?? null;

  const refresh = React.useCallback(() => {
    if (id) refetch().catch(() => undefined);
  }, [id, refetch]);

  const wasFocused = React.useRef(isFocused);
  React.useEffect(() => {
    if (isFocused && !wasFocused.current) refresh();
    wasFocused.current = isFocused;
  }, [isFocused, refresh]);

  const credits = profile?.creditsCents;
  const lastCredits = React.useRef(credits);
  React.useEffect(() => {
    if (lastCredits.current !== undefined && credits !== lastCredits.current) refresh();
    lastCredits.current = credits;
  }, [credits, refresh]);

  const abilities = React.useMemo(
    () => abilitiesOf(currentUser?.id, profile?.id ?? id, permissions ?? []),
    [currentUser?.id, id, permissions, profile?.id]
  );

  return {
    profile,
    abilities,
    loading,
    /** Nothing to show yet */
    waiting: !!id && loading && !data,
    refresh,
    hasMoreSlots: !!profile?.slots?.pageInfo?.hasNextPage,
    moreSlots: () => setSlots((current) => current + SLOTS_PAGE),
  };
}

/** What a profile does with an item of equipment: open its inspection, show or take a photo of its packing card */
export function useEquipmentActions(membershipId?: string | null) {
  const { t } = useTranslation('common');
  const openUser = useOpenUser();
  const notify = useNotifications();
  const pickImage = useImagePicker();
  const { open: openImage } = useImageViewer();
  const [updateEquipment] = useUpdateEquipmentMutation();
  const [uploadingId, setUploadingId] = React.useState<string | null>(null);

  const inspect = React.useCallback(
    (equipment: ProfileEquipment) => {
      if (!membershipId) return;
      openUser('EquipmentInspectionScreen', { equipmentId: equipment.id, membershipId });
    },
    [membershipId, openUser]
  );

  const viewCard = React.useCallback(
    (equipment: ProfileEquipment) => {
      if (equipment.packingCard) openImage(equipment.packingCard);
    },
    [openImage]
  );

  const uploadCard = React.useCallback(
    async (equipment: ProfileEquipment) => {
      const base64 = await pickImage().catch(() => undefined);
      if (!base64) return;
      setUploadingId(equipment.id);
      try {
        const { data } = await updateEquipment({
          variables: { id: Number(equipment.id), packingCard: `data:image/jpeg;base64,${base64}` },
        });
        const error = data?.updateEquipment?.errors?.[0];
        if (error) notify.error(error);
        else notify.success(t('profile.equipment.cardUploaded'));
      } catch {
        notify.error(t('profile.equipment.cardFailed'));
      } finally {
        setUploadingId(null);
      }
    },
    [notify, pickImage, t, updateEquipment]
  );

  return { inspect, viewCard, uploadCard, uploadingId };
}

/** Opens the board: where a member with no loads yet books one */
export function useOpenBoard() {
  const navigation = useNavigation();
  return React.useCallback(
    () => navigation.navigate('Authenticated', { screen: 'Manifest' } as never),
    [navigation]
  );
}
