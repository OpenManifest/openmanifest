import * as React from 'react';
import { DropzoneFields } from 'app/components/forms/dropzone/slice';
import { PlaneFields } from 'app/components/forms/plane/slice';
import { TicketTypeFields } from 'app/components/forms/ticket_type/slice';
import { Wizard } from 'app/components/carousel_wizard';
import type { WizardRef } from 'app/components/carousel_wizard/Wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import useMutationCreateDropzone from 'app/api/hooks/useMutationCreateDropzone';
import useMutationUpdateDropzone from 'app/api/hooks/useMutationUpdateDropzone';
import useMutationCreatePlane from 'app/api/hooks/useMutationCreatePlane';
import useMutationUpdatePlane from 'app/api/hooks/useMutationUpdatePlane';
import useMutationCreateTicketType from 'app/api/hooks/useMutationCreateTicketType';
import useMutationUpdateTicketType from 'app/api/hooks/useMutationUpdateTicketType';
import camelize from 'lodash/camelCase';
import { Permission } from 'app/api/schema.d';
import { useNavigation } from '@react-navigation/core';
import NameStep from './steps/Name';
import FederationStep from './steps/Federation';
import LocationStep from './steps/Location';
import AircraftStep from './steps/Aircraft';
import ThemingStep from './steps/Theming';
import DoneStep from './steps/Done';
import PermissionStep from './steps/Permissions';
import TicketTypeStep from './steps/TicketType';
import LogoStep from './steps/Logo';

function DropzoneSetupScreen() {
  const aircraft = useAppSelector((root) => root.forms.plane);
  const ticket = useAppSelector((root) => root.forms.ticketType);
  const dropzone = useAppSelector((root) => root.forms.dropzone);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const mutationCreateDropzone = useMutationCreateDropzone({
    onError: (error) => {
      dispatch(actions.notifications.showSnackbar({ message: error, variant: 'error' }));
    },
    onSuccess: (payload) => console.log(payload),
    onFieldError: (field, value) => {
      dispatch(actions.forms.dropzone.setFieldError([field as keyof DropzoneFields, value]));
      console.log(field, value);
    },
  });
  const mutationUpdateDropzone = useMutationUpdateDropzone({
    onError: (error) =>
      dispatch(actions.notifications.showSnackbar({ message: error, variant: 'error' })),
    onSuccess: (payload) => null,
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

  const onComplete = React.useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onNameNext = React.useCallback(async (): Promise<void> => {
    if (!dropzone.fields.name.value) {
      dispatch(actions.forms.dropzone.setFieldError(['name', 'Your dropzone must have a name']));
      throw new Error();
    }
  }, [dispatch, dropzone.fields.name.value]);

  const onFederationNext = React.useCallback(async (): Promise<void> => {
    if (!dropzone.fields.name.value) {
      dispatch(actions.forms.dropzone.setFieldError(['name', 'Your dropzone must have a name']));
      throw new Error();
    }
    if (!dropzone.fields.federation.value) {
      dispatch(
        actions.forms.dropzone.setFieldError([
          'federation',
          'Your dropzone must have an associated organization',
        ])
      );
      throw new Error();
    }
  }, [dispatch, dropzone.fields.federation.value, dropzone.fields.name.value]);

  const onLogoNext = React.useCallback(async () => {
    if (!dropzone.fields.primaryColor.value) {
      dispatch(
        actions.forms.dropzone.setFieldError(['primaryColor', 'Please pick a primary color'])
      );
      throw new Error();
    }
    // Create or update dropzone
    const result = !dropzone.original?.id
      ? await mutationCreateDropzone.mutate({
          federation: Number(dropzone.fields.federation.value?.id),
          name: dropzone.fields.name.value || '',
          banner: dropzone.fields.banner.value || '',
          primaryColor: dropzone.fields.primaryColor.value,
          secondaryColor: dropzone.fields.secondaryColor.value,
          lat: dropzone.fields.lat.value as number,
          lng: dropzone.fields.lng.value as number,
        })
      : await mutationUpdateDropzone.mutate({
          id: Number(dropzone.original.id),
          federation: Number(dropzone.fields.federation.value?.id),
          name: dropzone.fields.name.value || '',
          primaryColor: dropzone.fields.primaryColor.value,
          secondaryColor: dropzone.fields.secondaryColor.value,
          lat: dropzone.fields.lat.value,
          lng: dropzone.fields.lng.value,
          banner: dropzone.fields.banner.value || '',
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
    } else if (result?.fieldErrors?.length) {
      result?.fieldErrors?.find(({ field, message }) => {
        switch (camelize(field)) {
          case 'primaryColor':
            dispatch(actions.forms.dropzone.setFieldError(['primaryColor', message]));
            wizard.current?.scrollTo({ index: 3 });
            return true;
          case 'federation':
            wizard.current?.scrollTo({ index: 1 });
            dispatch(actions.forms.dropzone.setFieldError(['primaryColor', message]));
            return true;
          case 'name':
            wizard.current?.scrollTo({ index: 0 });
            dispatch(actions.forms.dropzone.setFieldError(['name', message]));
            return true;
          case 'lat':
          case 'lng':
            wizard.current?.scrollTo({ index: 2 });
            dispatch(actions.forms.dropzone.setFieldError(['lat', message]));
            return true;
          default:
            break;
        }
        return false;
      });
      throw new Error();
    }
  }, [
    dispatch,
    dropzone.fields.banner.value,
    dropzone.fields.federation.value?.id,
    dropzone.fields.lat.value,
    dropzone.fields.lng.value,
    dropzone.fields.name.value,
    dropzone.fields.primaryColor.value,
    dropzone.fields.secondaryColor.value,
    dropzone.original?.id,
    mutationCreateDropzone,
    mutationUpdateDropzone,
  ]);

  const onAircraftNext = React.useCallback(async () => {
    if (!aircraft.fields.name.value) {
      dispatch(actions.forms.plane.setFieldError(['name', 'You must name your aircraft']));
      throw new Error();
    }
    if (!aircraft.fields.registration.value) {
      dispatch(
        actions.forms.plane.setFieldError(['registration', 'Please provide aircraft registration'])
      );
      throw new Error();
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
    } else {
      result?.fieldErrors?.forEach(({ field, message }) => {
        switch (field) {
          case 'registration':
            dispatch(actions.forms.plane.setFieldError(['registration', message]));
            break;
          case 'name':
            dispatch(actions.forms.plane.setFieldError(['name', message]));
            break;
          case 'maxSlots':
            dispatch(actions.forms.plane.setFieldError(['maxSlots', message]));
            break;
          default:
            break;
        }
      });
      throw new Error();
    }
  }, [
    aircraft.fields.maxSlots.value,
    aircraft.fields.minSlots.value,
    aircraft.fields.name.value,
    aircraft.fields.registration.value,
    aircraft.original?.id,
    dispatch,
    dropzone?.original?.id,
    mutationCreatePlane,
    mutationUpdatePlane,
  ]);

  const onTicketTypeNext = React.useCallback(async () => {
    if (!ticket.fields.name.value) {
      dispatch(actions.forms.ticketType.setFieldError(['name', 'You must name your ticket']));
      throw new Error();
    }

    if (!ticket.fields.cost.value) {
      dispatch(actions.forms.ticketType.setFieldError(['cost', 'Tickets must have a price']));
      throw new Error();
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
    } else {
      result?.fieldErrors?.forEach(({ field, message }) => {
        switch (field) {
          case 'cost':
            dispatch(actions.forms.ticketType.setFieldError(['cost', message]));
            break;
          case 'name':
            dispatch(actions.forms.ticketType.setFieldError(['name', message]));
            break;
          case 'altitude':
            dispatch(actions.forms.ticketType.setFieldError(['altitude', message]));
            break;
          default:
            break;
        }
      });
      throw new Error();
    }
  }, [
    ticket.fields.name.value,
    ticket.fields.cost.value,
    ticket.fields.altitude.value,
    ticket.original?.id,
    mutationCreateTicketType,
    dropzone.original?.id,
    mutationUpdateTicketType,
    dispatch,
  ]);

  const noop = React.useCallback(() => Promise.resolve(), []);
  const wizard = React.useRef<WizardRef>();

  return (
    <Wizard
      dots
      steps={[
        {
          onBack: () => {
            dispatch(actions.forms.ticketType.setOpen(false));
            dispatch(actions.forms.plane.setOpen(false));
            dispatch(actions.forms.dropzone.setOpen(false));
            dispatch(actions.forms.ticketType.reset());
            dispatch(actions.forms.plane.reset());
            dispatch(actions.forms.dropzone.reset());
          },
          onNext: onNameNext,
          component: NameStep,
        },
        {
          onNext: onFederationNext,
          component: FederationStep,
        },
        { component: LocationStep },
        { component: ThemingStep, onNext: noop },
        {
          onNext: onLogoNext,
          component: LogoStep,
        },
        { component: AircraftStep, onNext: onAircraftNext },
        { component: TicketTypeStep, onNext: onTicketTypeNext },
        {
          component: (stepProps) => (
            <PermissionStep
              {...stepProps}
              permission={Permission.CreateSlot}
              title="Manifest"
              description="Who can manifest themselves on loads?"
            />
          ),
        },
        {
          component: (stepProps) => (
            <PermissionStep
              {...stepProps}
              description="Who can manifest other people on loads?"
              permission={Permission.CreateUserSlot}
              title="Manifest others"
            />
          ),
        },
        {
          component: DoneStep,
          onNext: async () => {
            dispatch(actions.global.setDropzone(dropzone.original));
            if (dropzone.fields.primaryColor.value) {
              dispatch(actions.global.setPrimaryColor(dropzone.fields.primaryColor.value));
            }
            if (dropzone.fields.secondaryColor.value) {
              dispatch(actions.global.setAccentColor(dropzone.fields.secondaryColor.value));
            }
            dispatch(actions.global.setDropzone(dropzone.original));

            dispatch(actions.forms.ticketType.setOpen(false));
            dispatch(actions.forms.plane.setOpen(false));
            dispatch(actions.forms.dropzone.setOpen(false));
            dispatch(actions.forms.ticketType.reset());
            dispatch(actions.forms.plane.reset());
            dispatch(actions.forms.dropzone.reset());

            // Set complete-flag to force navigation from dropzone screen
            dispatch(actions.screens.dropzoneWizard.complete());
            onComplete();
          },
        },
      ]}
    />
  );
}

export default DropzoneSetupScreen;
