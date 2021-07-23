import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import { DropzoneFields } from '../../../components/forms/dropzone/slice';
import { PlaneFields } from '../../../components/forms/plane/slice';
import { TicketTypeFields } from '../../../components/forms/ticket_type/slice';
import Wizard from '../../../components/wizard/Wizard';
import WizardCompleteStep from '../../../components/wizard/WizardCompleteStep';
import NameAndFederationStep from './steps/Name';
import LocationStep from './steps/Location';
import AircraftStep from './steps/Aircraft';
import ThemingStep from './steps/Theming';
import PermissionStep from './steps/Permissions';
import TicketTypeStep from './steps/TicketType';
import { actions, useAppDispatch, useAppSelector } from '../../../state';
import useMutationCreateDropzone from '../../../api/hooks/useMutationCreateDropzone';
import useMutationUpdateDropzone from '../../../api/hooks/useMutationUpdateDropzone';
import useMutationCreatePlane from '../../../api/hooks/useMutationCreatePlane';
import useMutationUpdatePlane from '../../../api/hooks/useMutationUpdatePlane';
import useMutationCreateTicketType from '../../../api/hooks/useMutationCreateTicketType';
import useMutationUpdateTicketType from '../../../api/hooks/useMutationUpdateTicketType';
import { Permission } from '../../../api/schema.d';

function DropzoneSetupScreen() {
  const aircraft = useAppSelector((root) => root.forms.plane);
  const ticket = useAppSelector((root) => root.forms.ticketType);
  const dropzone = useAppSelector((root) => root.forms.dropzone);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const mutationCreateDropzone = useMutationCreateDropzone({
    onError: (error) =>
      dispatch(actions.notifications.showSnackbar({ message: error, variant: 'error' })),
    onSuccess: (payload) => console.log(payload),
    onFieldError: (field, value) =>
      dispatch(actions.forms.dropzone.setFieldError([field as keyof DropzoneFields, value])),
  });
  const mutationUpdateDropzone = useMutationUpdateDropzone({
    onError: (error) =>
      dispatch(actions.notifications.showSnackbar({ message: error, variant: 'error' })),
    onSuccess: (payload) => console.log(payload),
    onFieldError: (field, value) =>
      dispatch(actions.forms.dropzone.setFieldError([field as keyof DropzoneFields, value])),
  });
  const mutationCreatePlane = useMutationCreatePlane({
    onError: (error) =>
      dispatch(actions.notifications.showSnackbar({ message: error, variant: 'error' })),
    onSuccess: (payload) => console.log(payload),
    onFieldError: (field, value) =>
      dispatch(actions.forms.plane.setFieldError([field as keyof PlaneFields, value])),
  });
  const mutationUpdatePlane = useMutationUpdatePlane({
    onError: (error) =>
      dispatch(actions.notifications.showSnackbar({ message: error, variant: 'error' })),
    onSuccess: (payload) => console.log(payload),
    onFieldError: (field, value) =>
      dispatch(actions.forms.plane.setFieldError([field as keyof PlaneFields, value])),
  });
  const mutationCreateTicketType = useMutationCreateTicketType({
    onError: (error) =>
      dispatch(actions.notifications.showSnackbar({ message: error, variant: 'error' })),
    onSuccess: (payload) => console.log(payload),
    onFieldError: (field, value) =>
      dispatch(actions.forms.ticketType.setFieldError([field as keyof TicketTypeFields, value])),
  });
  const mutationUpdateTicketType = useMutationUpdateTicketType({
    onError: (error) =>
      dispatch(actions.notifications.showSnackbar({ message: error, variant: 'error' })),
    onSuccess: (payload) => console.log(payload),
    onFieldError: (field, value) =>
      dispatch(actions.forms.ticketType.setFieldError([field as keyof TicketTypeFields, value])),
  });

  const onBasicInfoNext = React.useCallback(
    async (index: number, setIndex: (idx: number) => void): Promise<void> => {
      if (!dropzone.fields.name.value) {
        dispatch(actions.forms.dropzone.setFieldError(['name', 'Your dropzone must have a name']));
        return;
      }
      if (!dropzone.fields.federation.value) {
        dispatch(
          actions.forms.dropzone.setFieldError([
            'federation',
            'Your dropzone must have an associated organization',
          ])
        );
        return;
      }

      setIndex(index + 1);
    },
    [dispatch, dropzone.fields.federation.value, dropzone.fields.name.value]
  );

  const onThemingNext = React.useCallback(
    async (index: number, setIndex: (idx: number) => void) => {
      if (!dropzone.fields.primaryColor.value) {
        dispatch(
          actions.forms.dropzone.setFieldError(['primaryColor', 'Please pick a primary color'])
        );
        return;
      }
      if (!dropzone.fields.secondaryColor.value) {
        dispatch(
          actions.forms.dropzone.setFieldError(['secondaryColor', 'Please pick an accent color'])
        );
        return;
      }

      // Create or update dropzone
      const result = !dropzone.original?.id
        ? await mutationCreateDropzone.mutate({
            federationId: Number(dropzone.fields.federation.value?.id),
            name: dropzone.fields.name.value || '',
            banner: '',
            primaryColor: dropzone.fields.primaryColor.value,
            secondaryColor: dropzone.fields.secondaryColor.value,
            lat: dropzone.fields.lat.value as number,
            lng: dropzone.fields.lng.value as number,
          })
        : await mutationUpdateDropzone.mutate({
            id: Number(dropzone.original.id),
            federationId: Number(dropzone.fields.federation.value?.id),
            name: dropzone.fields.name.value || '',
            primaryColor: dropzone.fields.primaryColor.value,
            secondaryColor: dropzone.fields.secondaryColor.value,
            lat: dropzone.fields.lat.value,
            lng: dropzone.fields.lng.value,
            banner: '',
          });

      if (!result?.errors?.length && result?.dropzone?.id) {
        dispatch(actions.forms.dropzone.setOpen(result?.dropzone));
        dispatch(actions.global.setDropzone(result?.dropzone));
        if (result.dropzone.primaryColor) {
          dispatch(actions.global.setPrimaryColor(result?.dropzone?.primaryColor));
        }
        if (result.dropzone.secondaryColor) {
          dispatch(actions.global.setAccentColor(result?.dropzone?.secondaryColor));
        }
        setIndex(index + 1);
      }
    },
    [
      dispatch,
      dropzone.fields.federation.value?.id,
      dropzone.fields.lat.value,
      dropzone.fields.lng.value,
      dropzone.fields.name.value,
      dropzone.fields.primaryColor.value,
      dropzone.fields.secondaryColor.value,
      dropzone.original?.id,
      mutationCreateDropzone,
      mutationUpdateDropzone,
    ]
  );

  const onAircraftNext = React.useCallback(
    async (index: number, setIndex: (idx: number) => void) => {
      if (!aircraft.fields.name.value) {
        dispatch(actions.forms.plane.setFieldError(['name', 'You must name your aircraft']));
        return;
      }
      if (!aircraft.fields.registration.value) {
        dispatch(
          actions.forms.plane.setFieldError([
            'registration',
            'Please provide aircraft registration',
          ])
        );
        return;
      }

      // Create or update dropzone
      const result = !aircraft.original?.id
        ? await mutationCreatePlane.mutate({
            dropzoneId: Number(dropzone?.original?.id),
            name: aircraft.fields.name.value,
            registration: aircraft.fields.registration.value,
            minSlots: Number(aircraft.fields.minSlots.value),
            maxSlots: Number(aircraft.fields.maxSlots.value),
          })
        : await mutationUpdatePlane.mutate({
            id: Number(aircraft.original.id),
            name: aircraft.fields.name.value,
            registration: aircraft.fields.registration.value,
            minSlots: aircraft.fields.minSlots.value,
            maxSlots: aircraft.fields.maxSlots.value,
          });

      if (!result?.errors?.length && result?.plane?.id) {
        dispatch(actions.forms.plane.setOpen(result?.plane));
        setIndex(index + 1);
      }
    },
    [
      aircraft.fields.maxSlots.value,
      aircraft.fields.minSlots.value,
      aircraft.fields.name.value,
      aircraft.fields.registration.value,
      aircraft.original?.id,
      dispatch,
      dropzone?.original?.id,
      mutationCreatePlane,
      mutationUpdatePlane,
    ]
  );

  const onTicketTypeNext = React.useCallback(
    async (index: number, setIndex: (idx: number) => void) => {
      if (!ticket.fields.name.value) {
        dispatch(actions.forms.ticketType.setFieldError(['name', 'You must name your ticket']));
        return;
      }

      if (!ticket.fields.cost.value) {
        dispatch(actions.forms.ticketType.setFieldError(['cost', 'Tickets must have a price']));
        return;
      }

      // Create or update dropzone
      const result = !ticket.original?.id
        ? await mutationCreateTicketType.mutate({
            dropzoneId: Number(dropzone.original?.id),
            name: ticket.fields.name.value,
            cost: ticket.fields.cost.value,
            altitude: ticket.fields.altitude.value,
            isTandem: false,
            allowManifestingSelf: true,
          })
        : await mutationUpdateTicketType.mutate({
            id: Number(ticket.original.id),
            name: ticket.fields.name.value,
            cost: ticket.fields.cost.value,
            altitude: ticket.fields.altitude.value,
            isTandem: false,
            allowManifestingSelf: true,
          });

      if (!result?.errors?.length && result?.ticketType?.id) {
        dispatch(actions.forms.ticketType.setOpen(result.ticketType));
        setIndex(index + 1);
      }
    },
    [
      ticket.fields.name.value,
      ticket.fields.cost.value,
      ticket.fields.altitude.value,
      ticket.original?.id,
      mutationCreateTicketType,
      dropzone.original?.id,
      mutationUpdateTicketType,
      dispatch,
    ]
  );

  return (
    <Wizard>
      <NameAndFederationStep
        onBack={() => {
          dispatch(actions.forms.dropzoneWizard.setOpen(false));
          dispatch(actions.forms.dropzoneWizard.reset());
          dispatch(actions.forms.ticketType.setOpen(false));
          dispatch(actions.forms.plane.setOpen(false));
          dispatch(actions.forms.dropzone.setOpen(false));
          dispatch(actions.forms.ticketType.reset());
          dispatch(actions.forms.plane.reset());
          dispatch(actions.forms.dropzone.reset());
          navigation.goBack();
        }}
        backButtonLabel="Cancel"
        nextButtonLabel="Next"
        onNext={onBasicInfoNext}
      />
      <LocationStep
        onBack={(idx, setIndex) => setIndex(idx - 1)}
        onNext={(idx, setIndex) => setIndex(idx + 1)}
        backButtonLabel="Back"
        nextButtonLabel="Next"
      />

      <ThemingStep
        onBack={(idx, setIndex) => setIndex(idx - 1)}
        onNext={onThemingNext}
        loading={mutationCreateDropzone.loading || mutationUpdateDropzone.loading}
        nextButtonLabel="Next"
        backButtonLabel="Back"
      />
      <AircraftStep
        onBack={(idx, setIndex) => setIndex(idx - 1)}
        onNext={onAircraftNext}
        loading={mutationCreatePlane.loading || mutationUpdatePlane.loading}
        nextButtonLabel="Next"
        backButtonLabel="Back"
      />
      <TicketTypeStep
        onBack={(idx, setIndex) => setIndex(idx - 1)}
        onNext={onTicketTypeNext}
        loading={mutationCreateTicketType.loading || mutationUpdateTicketType.loading}
        nextButtonLabel="Next"
        backButtonLabel="Back"
      />
      <PermissionStep
        title="Who can manifest?"
        permission={Permission.CreateSlot}
        onBack={(idx, setIndex) => setIndex(idx - 1)}
        onNext={(idx, setIndex) => setIndex(idx + 1)}
        nextButtonLabel="Next"
        backButtonLabel="Back"
      />
      <PermissionStep
        title="Manifest other people?"
        permission={Permission.CreateUserSlot}
        onBack={(idx, setIndex) => setIndex(idx - 1)}
        onNext={(idx, setIndex) => {
          setIndex(idx + 1);
        }}
        nextButtonLabel="Next"
        backButtonLabel="Back"
      />
      <WizardCompleteStep
        title="Setup complete"
        subtitle="You can configure settings under the Settings screen"
        backButtonLabel="Back"
        nextButtonLabel="Done"
        onBack={(idx, setIndex) => setIndex(idx - 1)}
        onNext={() => {
          dispatch(actions.global.setDropzone(dropzone.original));
          if (dropzone.fields.primaryColor.value) {
            dispatch(actions.global.setPrimaryColor(dropzone.fields.primaryColor.value));
          }
          if (dropzone.fields.secondaryColor.value) {
            dispatch(actions.global.setAccentColor(dropzone.fields.secondaryColor.value));
          }
          dispatch(actions.global.setDropzone(dropzone.original));

          dispatch(actions.forms.dropzoneWizard.setOpen(false));
          dispatch(actions.forms.dropzoneWizard.reset());
          dispatch(actions.forms.ticketType.setOpen(false));
          dispatch(actions.forms.plane.setOpen(false));
          dispatch(actions.forms.dropzone.setOpen(false));
          dispatch(actions.forms.ticketType.reset());
          dispatch(actions.forms.plane.reset());
          dispatch(actions.forms.dropzone.reset());

          // Set complete-flag to force navigation from dropzone screen
          dispatch(actions.forms.dropzoneWizard.complete());
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          navigation.replace('Authenticated', { screen: 'HomeScreen' });
        }}
      />
    </Wizard>
  );
}

export default DropzoneSetupScreen;
