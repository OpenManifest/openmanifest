import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Portal, Modal } from 'react-native-paper';
import Wizard from '../../wizard/Wizard';
import WizardCompleteStep from '../../wizard/WizardCompleteStep';
import FederationStep from './steps/Federation';
import RigStep from './steps/Rig';
import ReserveRepackStep from './steps/ReserveRepack';
import WingloadingStep from './steps/Wingloading';
import { actions, useAppDispatch, useAppSelector } from '../../../state';
import useMutationUpdateUser from '../../../api/hooks/useMutationUpdateUser';
import useMutationUpdateRig from '../../../api/hooks/useMutationUpdateRig';
import useMutationCreateRig from '../../../api/hooks/useMutationCreateRig';
import { UserFields } from '../../forms/user/slice';
import { RigFields } from '../../forms/rig/slice';

function UserWizardScreen() {
  const userForm = useAppSelector((root) => root.forms.user);
  const rigForm = useAppSelector((root) => root.forms.rig);
  const state = useAppSelector((root) => root.forms.userWizard);
  const dispatch = useAppDispatch();
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

  const onFederationNext = React.useCallback(
    async (index: number, setIndex: (idx: number) => void) => {
      // Validate
      if (!userForm.fields.license?.value?.id) {
        dispatch(actions.forms.user.setFieldError(['license', 'You must select a license']));
        return false;
      }

      // Update user license
      try {
        await mutationUpdateUser.mutate({
          id: Number(userForm.original?.id),
          licenseId: Number(userForm.fields.license?.value?.id),
        });
        return setIndex(index + 1);
      } catch (_) {
        return false;
      }
    },
    [dispatch, mutationUpdateUser, userForm.fields.license?.value?.id, userForm.original?.id]
  );

  const onRigNext = React.useCallback(
    async (index: number, setIndex: (idx: number) => void) => {
      // Validate
      if (!rigForm.fields.make?.value) {
        dispatch(actions.forms.rig.setFieldError(['make', 'Please select manufacturer']));
        return;
      }

      if (!rigForm.fields.model?.value) {
        dispatch(actions.forms.rig.setFieldError(['model', 'Please enter a model name']));
        return;
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
        setIndex(index + 1);
      } catch (err) {
        console.error(err);
      }
    },
    [
      rigForm.fields.make.value,
      rigForm.fields.model.value,
      rigForm.fields.serial.value,
      rigForm.original?.id,
      dispatch,
      mutationCreateRig,
      userForm.original?.id,
      mutationUpdateRig,
    ]
  );

  const onReserveRepackNext = React.useCallback(
    async (index: number, setIndex: (idx: number) => void) => {
      // Validate
      if (!rigForm.fields.repackExpiresAt?.value) {
        dispatch(
          actions.forms.rig.setFieldError([
            'repackExpiresAt',
            "Select repack date, even if it's in the past",
          ])
        );
        return false;
      }

      // Update repack expiry date
      try {
        const rig = await mutationUpdateRig.mutate({
          id: Number(rigForm.original?.id),
          repackExpiresAt: rigForm.fields.repackExpiresAt.value,
        });
        if (rig?.rig) {
          dispatch(actions.forms.rig.setOpen(rig.rig));
        }
        return setIndex(index + 1);
      } catch (_) {
        return false;
      }
    },
    [dispatch, mutationUpdateRig, rigForm.fields.repackExpiresAt.value, rigForm.original?.id]
  );

  const onWingloadingNext = React.useCallback(
    async (index: number, setIndex: (idx: number) => void) => {
      // Validate
      if (!rigForm.fields.canopySize?.value) {
        dispatch(actions.forms.rig.setFieldError(['canopySize', 'You must provide a canopy size']));
        return false;
      }

      if (!userForm.fields.exitWeight?.value) {
        dispatch(
          actions.forms.user.setFieldError(['exitWeight', 'You must enter your exit weight'])
        );
        return false;
      }

      // Update repack expiry date
      try {
        await mutationUpdateRig.mutate({
          id: Number(rigForm.original?.id),
          canopySize: rigForm.fields.canopySize.value,
        });
        await mutationUpdateUser.mutate({
          id: Number(userForm.original?.id),
          exitWeight: Number(userForm.fields.exitWeight?.value),
        });

        setIndex(index + 1);
      } catch (e) {
        console.error(e);
      }
      return null;
    },
    [
      rigForm.fields.canopySize.value,
      rigForm.original?.id,
      userForm.fields.exitWeight?.value,
      userForm.original?.id,
      dispatch,
      mutationUpdateRig,
      mutationUpdateUser,
    ]
  );

  return (
    <Portal>
      <Modal
        visible={state.open}
        dismissable={false}
        style={styles.modal}
        contentContainerStyle={{ height: '100%' }}
      >
        <Wizard>
          <FederationStep
            backButtonLabel="Cancel"
            nextButtonLabel="Next"
            onBack={() => {
              dispatch(actions.forms.userWizard.setOpen(false));
              dispatch(actions.forms.user.setOpen(false));
              dispatch(actions.forms.rig.setOpen(false));
              dispatch(actions.forms.userWizard.reset());
              dispatch(actions.forms.user.reset());
              dispatch(actions.forms.rig.reset());
            }}
            loading={mutationUpdateUser.loading}
            onNext={onFederationNext}
          />
          <RigStep
            backButtonLabel="Back"
            nextButtonLabel="Next"
            onBack={(index, setIndex) => {
              setIndex(index - 1);
            }}
            loading={
              mutationUpdateUser.loading || mutationUpdateRig.loading || mutationCreateRig.loading
            }
            onNext={onRigNext}
          />
          <ReserveRepackStep
            backButtonLabel="Back"
            nextButtonLabel="Next"
            loading={
              mutationUpdateUser.loading || mutationUpdateRig.loading || mutationCreateRig.loading
            }
            onBack={(index, setIndex) => {
              setIndex(index - 1);
            }}
            onNext={onReserveRepackNext}
          />
          <WingloadingStep
            backButtonLabel="Back"
            nextButtonLabel="Next"
            loading={
              mutationUpdateUser.loading || mutationUpdateRig.loading || mutationCreateRig.loading
            }
            onBack={(index, setIndex) => {
              setIndex(index - 1);
            }}
            onNext={onWingloadingNext}
          />

          <WizardCompleteStep
            title="You're all set!"
            subtitle="You can configure your settings on the profile page"
            backButtonLabel="Back"
            nextButtonLabel="Done"
            onBack={(index, setIndex) => {
              setIndex(index - 1);
            }}
            onNext={() => {
              dispatch(actions.forms.userWizard.setOpen(false));
              dispatch(actions.forms.user.setOpen(false));
              dispatch(actions.forms.rig.setOpen(false));
              dispatch(actions.forms.userWizard.reset());
              dispatch(actions.forms.user.reset());
              dispatch(actions.forms.rig.reset());
            }}
          />
        </Wizard>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    ...StyleSheet.absoluteFillObject,
    paddingLeft: 0,
    marginLeft: 0,
    marginBottom: 0,
    marginTop: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    backgroundColor: 'red',
    display: 'flex',
    width: '100%',
    height: '100%',
    flex: 1,
    alignItems: 'center',
  },
});

export default UserWizardScreen;
