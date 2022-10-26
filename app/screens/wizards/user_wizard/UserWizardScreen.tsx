import * as React from 'react';
import { Wizard } from 'app/components/navigation_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import {
  useJoinFederationMutation,
  useCreateRigMutation,
  useUpdateRigMutation,
} from 'app/api/reflection';
import useMutationUpdateUser from 'app/api/hooks/useMutationUpdateUser';
import { UserFields } from 'app/components/forms/user/slice';
import { License, Rig } from 'app/api/schema.d';
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
import AvatarStep from './steps/Avatar';

function UserWizardScreen() {
  const userForm = useAppSelector((root) => root.forms.user);
  const rigForm = useAppSelector((root) => root.forms.rig);
  const state = useAppSelector((root) => root.screens.userWizard);
  const dispatch = useAppDispatch();

  const [joinFederation] = useJoinFederationMutation();
  const mutationUpdateUser = useMutationUpdateUser({
    onSuccess: () => null,
    onError: (message) =>
      dispatch(actions.notifications.showSnackbar({ message, variant: 'error' })),
    onFieldError: (field, value) =>
      dispatch(actions.forms.user.setFieldError([field as keyof UserFields, value])),
  });
  const [mutationUpdateRig] = useUpdateRigMutation();
  const [mutationCreateRig] = useCreateRigMutation();

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
      dropzoneUser: Number(userForm.original?.id),
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
          federation: Number(userForm.federation?.value?.id),
        },
      });
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
          federation: Number(userForm.federation?.value?.id),
        },
      });
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

    try {
      const response = await joinFederation({
        variables: {
          federation: Number(userForm.federation?.value?.id),
          license: Number(userForm.fields.license?.value?.id),
        },
      });
      if (response.data?.joinFederation?.errors) {
        response.data?.joinFederation?.errors?.map((message) =>
          dispatch(actions.forms.user.setFieldError(['license', message]))
        );
        throw new Error();
      }
    } catch (e) {
      console.log(e);
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
      if (!rigForm.original?.id) {
        const response = await mutationCreateRig({
          variables: {
            make: rigForm.fields.make.value,
            model: rigForm.fields.model.value,
            serial: rigForm.fields.serial.value,
            userId: Number(userForm.original?.id),
          },
        });
        if (response?.data?.createRig?.rig) {
          dispatch(actions.forms.rig.setOriginal(response?.data?.createRig?.rig as Rig));
        }
      } else {
        const response = await mutationUpdateRig({
          variables: {
            id: Number(rigForm.original?.id),
            make: rigForm.fields.make.value,
            model: rigForm.fields.model.value,
            serial: rigForm.fields.serial.value,
            userId: Number(userForm.original?.id),
          },
        });
        if (response?.data?.updateRig?.rig) {
          dispatch(actions.forms.rig.setOriginal(response?.data?.updateRig?.rig as Rig));
        }
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
    const { data } = await mutationUpdateRig({
      variables: {
        id: Number(rigForm.original?.id),
        repackExpiresAt: rigForm.fields.repackExpiresAt.value,
      },
    });
    if (data?.updateRig?.rig) {
      dispatch(actions.forms.rig.setOriginal(data?.updateRig?.rig as Rig));
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

    await mutationUpdateRig({
      variables: {
        id: Number(rigForm.original?.id),
        canopySize: rigForm.fields.canopySize.value,
      },
    });
    await mutationUpdateUser.mutate({
      dropzoneUser: Number(userForm.original?.id),
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

  const onImageNext = React.useCallback(async () => {
    try {
      if (
        userForm.fields.image?.value &&
        userForm.fields.image?.value !== userForm.original?.user?.image
      ) {
        // Upload image
        await mutationUpdateUser.mutate({
          dropzoneUser: Number(userForm?.original?.id),
          image: userForm.fields.image.value,
        });
      }
    } catch (e) {
      console.log(e);
    }
  }, [
    mutationUpdateUser,
    userForm.fields.image.value,
    userForm.original?.id,
    userForm.original?.user?.image,
  ]);

  const steps = React.useMemo(
    () =>
      [
        {
          component: RealNameStep,
          onNext: onNameNext,
          onBack: () => {
            dispatch(actions.forms.user.setOpen(false));
            dispatch(actions.forms.rig.setOpen(false));
            dispatch(actions.forms.user.reset());
            dispatch(actions.forms.rig.reset());
          },
        },
        { component: NicknameStep, onNext: onNicknameNext },
        { component: AvatarStep, onNext: onImageNext },
        { component: FederationStep, onNext: onFederationNext },
        userForm.federation?.value?.id && userForm?.federation?.value?.name?.toLowerCase() === 'apf'
          ? { component: FederationNumberStep, onNext: onFederationNumberNext }
          : null,
        { component: LicenseStep, onNext: onLicenseNext },
        { component: AskForRigStep },
        state?.skipRigSetup ? null : { component: RigStep, onNext: onRigNext },
        state?.skipRigSetup ? null : { component: ReserveRepackStep, onNext: onReserveRepackNext },
        state?.skipRigSetup ? null : { component: WingloadingStep, onNext: onWingloadingNext },
        {
          component: DoneStep,
          onNext: async () => {
            dispatch(actions.forms.user.setOpen(false));
            dispatch(actions.forms.rig.setOpen(false));
            dispatch(actions.forms.user.reset());
            dispatch(actions.forms.rig.reset());
          },
        },
      ].filter(Boolean),
    [
      dispatch,
      onFederationNext,
      onFederationNumberNext,
      onImageNext,
      onLicenseNext,
      onNameNext,
      onNicknameNext,
      onReserveRepackNext,
      onRigNext,
      onWingloadingNext,
      state?.skipRigSetup,
      userForm.federation?.value?.id,
      userForm.federation?.value?.name,
    ]
  );

  return <Wizard name="UserWizard" dots {...{ steps }} />;
}

export default UserWizardScreen;
