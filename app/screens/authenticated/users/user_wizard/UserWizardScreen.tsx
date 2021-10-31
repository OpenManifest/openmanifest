import * as React from 'react';
import { Wizard } from 'app/components/navigation_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { useJoinFederationMutation } from 'app/api/reflection';
import useMutationUpdateUser from 'app/api/hooks/useMutationUpdateUser';
import useMutationUpdateRig from 'app/api/hooks/useMutationUpdateRig';
import useMutationCreateRig from 'app/api/hooks/useMutationCreateRig';
import { UserFields } from 'app/components/forms/user/slice';
import { RigFields } from 'app/components/forms/rig/slice';
import { License } from 'app/api/schema.d';
import FederationStep from './steps/Federation';
import FederationNumberStep from './steps/FederationNumber';
import RealNameStep from './steps/RealName';
import NicknameStep from './steps/Nickname';
import LicenseStep from './steps/License';
import RigStep from './steps/Rig';
import ReserveRepackStep from './steps/ReserveRepack';
import AskForRigStep from './steps/AskForRig';
import WingloadingStep from './steps/Wingloading';
import DoneStep from './steps/Done';

function UserWizardScreen() {
  const userForm = useAppSelector((root) => root.forms.user);
  const rigForm = useAppSelector((root) => root.forms.rig);
  const state = useAppSelector((root) => root.forms.userWizard);
  const dispatch = useAppDispatch();

  const [joinFederation] = useJoinFederationMutation();
  const mutationUpdateUser = useMutationUpdateUser({
    onSuccess: (e) => true,
    onError: (message) =>
      dispatch(actions.notifications.showSnackbar({ message, variant: 'error' })),
    onFieldError: (field, value) =>
      dispatch(actions.forms.user.setFieldError([field as keyof UserFields, value])),
  });
  const mutationUpdateRig = useMutationUpdateRig({
    onSuccess: () => true,
    onError: (message) =>
      dispatch(actions.notifications.showSnackbar({ message, variant: 'error' })),
    onFieldError: (field, value) =>
      dispatch(actions.forms.rig.setFieldError([field as keyof RigFields, value])),
  });
  const mutationCreateRig = useMutationCreateRig({
    onSuccess: (e) => true,
    onError: (message) =>
      dispatch(actions.notifications.showSnackbar({ message, variant: 'error' })),
    onFieldError: (field, value) =>
      dispatch(actions.forms.rig.setFieldError([field as keyof RigFields, value])),
  });

  const onNameNext = React.useCallback(async () => {
    // Validate
    if (!userForm.fields.name.value || !/\s/.test(userForm.fields.name.value)) {
      dispatch(
        actions.forms.user.setFieldError(['name', 'Please enter your full name, including surname'])
      );
      throw new Error();
    }
  }, [dispatch, userForm.fields.name.value]);

  const onNicknameNext = React.useCallback(async () => {
    // Update user license
    const result = await mutationUpdateUser.mutate({
      id: Number(userForm.original?.id),
      nickname: userForm.fields.nickname.value,
      name: userForm.fields.name.value,
    });

    if (result?.errors) {
      throw new Error();
    }
  }, [
    mutationUpdateUser,
    userForm.fields.name.value,
    userForm.fields.nickname.value,
    userForm.original?.id,
  ]);

  const onFederationNext = React.useCallback(async () => {
    if (userForm.federation.value?.name?.toLowerCase() === 'apf') {
      const mutationResult = await joinFederation({
        variables: {
          federationId: Number(userForm.federation?.value?.id),
        },
      });
      console.log({ data: mutationResult.data?.joinFederation });
      const license = mutationResult?.data?.joinFederation?.userFederation?.license;

      if (license) {
        dispatch(actions.forms.user.setField(['license', license as License]));
      }
    }
  }, [dispatch, joinFederation, userForm.federation.value?.id, userForm.federation.value?.name]);

  const onFederationNumberNext = React.useCallback(async () => {
    // Validate
    if (
      userForm.federation.value?.name?.toLowerCase() === 'apf' &&
      !userForm.fields.apfNumber.value
    ) {
      dispatch(actions.forms.user.setFieldError(['apfNumber', 'Please enter your APF number']));
      throw new Error();
    }

    if (userForm.federation.value?.name?.toLowerCase() === 'apf') {
      const mutationResult = await joinFederation({
        variables: {
          uid: userForm.fields.apfNumber.value,
          federationId: Number(userForm.federation?.value?.id),
        },
      });
      console.log({ data: mutationResult.data?.joinFederation });
      const license = mutationResult?.data?.joinFederation?.userFederation?.license;

      if (license) {
        dispatch(actions.forms.user.setField(['license', license as License]));
      }
    }
  }, [
    dispatch,
    joinFederation,
    userForm.federation.value?.id,
    userForm.federation.value?.name,
    userForm.fields.apfNumber.value,
  ]);

  const onLicenseNext = React.useCallback(async () => {
    // Validate
    if (!userForm.fields.license?.value?.id) {
      dispatch(actions.forms.user.setFieldError(['license', 'You must select a license']));
      throw new Error();
    }

    const response = await joinFederation({
      variables: {
        federationId: Number(userForm.federation?.value?.id),
        licenseId: Number(userForm.fields.license?.value?.id),
      },
    });
    if (response.data?.joinFederation?.errors) {
      throw new Error();
    }
  }, [
    dispatch,
    joinFederation,
    userForm.federation?.value?.id,
    userForm.fields.license?.value?.id,
  ]);

  const onRigNext = React.useCallback(async () => {
    // Validate
    if (!rigForm.fields.make?.value) {
      dispatch(actions.forms.rig.setFieldError(['make', 'Please select manufacturer']));
      throw new Error();
    }

    if (!rigForm.fields.model?.value) {
      dispatch(actions.forms.rig.setFieldError(['model', 'Please enter a model name']));
      throw new Error();
    }

    // Create user rig
    try {
      const rig = !rigForm.original?.id
        ? await mutationCreateRig.mutate({
            make: rigForm.fields.make.value,
            model: rigForm.fields.model.value,
            serial: rigForm.fields.serial.value,
            userId: Number(userForm.original?.id),
          })
        : await mutationUpdateRig.mutate({
            id: Number(rigForm.original?.id),
            make: rigForm.fields.make.value,
            model: rigForm.fields.model.value,
            serial: rigForm.fields.serial.value,
            userId: Number(userForm.original?.id),
          });

      if (rig?.rig) {
        dispatch(actions.forms.rig.setOpen(rig.rig));
      }
    } catch (err) {
      console.error(err);
    }
  }, [
    rigForm.fields.make.value,
    rigForm.fields.model.value,
    rigForm.fields.serial.value,
    rigForm.original?.id,
    dispatch,
    mutationCreateRig,
    userForm.original?.id,
    mutationUpdateRig,
  ]);

  const onReserveRepackNext = React.useCallback(async () => {
    // Validate
    if (!rigForm.fields.repackExpiresAt?.value) {
      dispatch(
        actions.forms.rig.setFieldError([
          'repackExpiresAt',
          "Select repack date, even if it's in the past",
        ])
      );
      throw new Error();
    }

    // Update repack expiry date
    const rig = await mutationUpdateRig.mutate({
      id: Number(rigForm.original?.id),
      repackExpiresAt: rigForm.fields.repackExpiresAt.value,
    });
    if (rig?.rig) {
      dispatch(actions.forms.rig.setOpen(rig.rig));
    }
  }, [dispatch, mutationUpdateRig, rigForm.fields.repackExpiresAt.value, rigForm.original?.id]);

  const onWingloadingNext = React.useCallback(async () => {
    // Validate
    if (!rigForm.fields.canopySize?.value) {
      dispatch(actions.forms.rig.setFieldError(['canopySize', 'You must provide a canopy size']));
      throw new Error();
    }

    if (!userForm.fields.exitWeight?.value) {
      dispatch(actions.forms.user.setFieldError(['exitWeight', 'You must enter your exit weight']));
      throw new Error();
    }

    await mutationUpdateRig.mutate({
      id: Number(rigForm.original?.id),
      canopySize: rigForm.fields.canopySize.value,
    });
    await mutationUpdateUser.mutate({
      id: Number(userForm.original?.id),
      exitWeight: Number(userForm.fields.exitWeight?.value),
    });
  }, [
    rigForm.fields.canopySize.value,
    rigForm.original?.id,
    userForm.fields.exitWeight?.value,
    userForm.original?.id,
    dispatch,
    mutationUpdateRig,
    mutationUpdateUser,
  ]);

  return (
    <Wizard
      name="UserWizard"
      dots
      steps={[
        {
          component: RealNameStep,
          onNext: onNameNext,
          onBack: () => {
            dispatch(actions.forms.userWizard.setOpen(false));
            dispatch(actions.forms.user.setOpen(false));
            dispatch(actions.forms.rig.setOpen(false));
            dispatch(actions.forms.userWizard.reset());
            dispatch(actions.forms.user.reset());
            dispatch(actions.forms.rig.reset());
          },
        },
        { component: NicknameStep, onNext: onNicknameNext },
        { component: FederationStep, onNext: onFederationNext },
        userForm?.federation?.value?.name?.toLowerCase() === 'apf'
          ? { component: FederationNumberStep, onNext: onFederationNumberNext }
          : null,
        { component: LicenseStep, onNext: onLicenseNext },
        { component: AskForRigStep },
        !state?.fields?.skipRigSetup ? { component: RigStep, onNext: onRigNext } : null,
        !state?.fields?.skipRigSetup
          ? { component: ReserveRepackStep, onNext: onReserveRepackNext }
          : null,
        !state?.fields?.skipRigSetup
          ? { component: WingloadingStep, onNext: onWingloadingNext }
          : null,
        {
          component: DoneStep,
          onNext: async () => {
            dispatch(actions.forms.userWizard.setOpen(false));
            dispatch(actions.forms.user.setOpen(false));
            dispatch(actions.forms.rig.setOpen(false));
            dispatch(actions.forms.userWizard.reset());
            dispatch(actions.forms.user.reset());
            dispatch(actions.forms.rig.reset());
          },
        },
      ].filter(Boolean)}
    />
  );
}

export default UserWizardScreen;
