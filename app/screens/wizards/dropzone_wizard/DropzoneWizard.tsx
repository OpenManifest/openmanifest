import * as React from 'react';
import { DropzoneFields } from 'app/components/forms/dropzone/slice';
import { Wizard } from 'app/components/carousel_wizard';
import type { WizardRef } from 'app/components/carousel_wizard/Wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import useMutationCreateDropzone from 'app/api/hooks/useMutationCreateDropzone';
import useMutationUpdateDropzone from 'app/api/hooks/useMutationUpdateDropzone';
import camelize from 'lodash/camelCase';
import { Permission } from 'app/api/schema.d';
import { useNavigation } from '@react-navigation/core';
import { useNotifications } from 'app/providers/notifications';
import NameStep from './steps/Name';
import FederationStep from './steps/Federation';
import LocationStep from './steps/Location';
import ThemingStep from './steps/Theming';
import DoneStep from './steps/Done';
import PermissionStep from './steps/Permissions';
import LogoStep from './steps/Logo';

function DropzoneSetupScreen() {
  const dropzone = useAppSelector((root) => root.forms.dropzone);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const notify = useNotifications();

  const mutationCreateDropzone = useMutationCreateDropzone({
    onError: (error) => {
      notify.error(error);
    },
    onSuccess: (payload) => console.log(payload),
    onFieldError: (field, value) => {
      dispatch(actions.forms.dropzone.setFieldError([field as keyof DropzoneFields, value]));
      console.log(field, value);
    },
  });
  const mutationUpdateDropzone = useMutationUpdateDropzone({
    onError: (error) => notify.error(error),
    onSuccess: (payload) => null,
    onFieldError: (field, value) =>
      dispatch(actions.forms.dropzone.setFieldError([field as keyof DropzoneFields, value])),
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

  const noop = React.useCallback(() => Promise.resolve(), []);
  const wizard = React.useRef<WizardRef>();

  return (
    <Wizard
      dots
      steps={[
        {
          onBack: () => {
            dispatch(actions.forms.dropzone.setOpen(false));
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

            dispatch(actions.forms.dropzone.setOpen(false));
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
