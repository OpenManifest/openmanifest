import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Portal, Modal, Dialog } from "react-native-paper";
import Wizard from "../../wizard/Wizard";
import FederationStep from "./steps/Federation";
import RigStep from "./steps/Rig";
import ReserveRepackStep from "./steps/ReserveRepack";
import WingloadingStep from "./steps/Wingloading";
import { actions, useAppDispatch, useAppSelector } from "../../../redux";
import useMutationUpdateUser from "../../../graphql/hooks/useMutationUpdateUser";
import useMutationUpdateRig from "../../../graphql/hooks/useMutationUpdateRig";
import useMutationCreateRig from "../../../graphql/hooks/useMutationCreateRig";

function UserWizardScreen() {
  const userForm = useAppSelector(state => state.forms.user);
  const rigForm = useAppSelector(state => state.forms.rig);
  const state = useAppSelector(state => state.forms.userWizard);
  const dispatch = useAppDispatch();
  const mutationUpdateUser = useMutationUpdateUser({
    onSuccess: (e) => true,
    onError: (e) => console.error(e),
    onFieldError: (l,v) => console.error(l,v)
  });
  const mutationUpdateRig = useMutationUpdateRig({
    onSuccess: () => true,
    onError: (e) => console.error(e),
    onFieldError: (l,v) => console.error(l,v)
  });
  const mutationCreateRig = useMutationCreateRig({
    onSuccess: (e) => true,
    onFieldError: (l,v) => console.error(l,v)
  });

  const onFederationNext = React.useCallback(async () => {
    // Validate
    if (!userForm.fields.license?.value?.id) {
      dispatch(actions.forms.user.setFieldError(["license", "You must select a license"]));
      return false;
    }

    // Update user license
    try {
      await mutationUpdateUser.mutate({
        id: Number(userForm.original.id),
        licenseId: Number(userForm.fields.license?.value?.id)
      });
      return true;
    } catch (_) {
      return false;
    }    
  }, [JSON.stringify(userForm.fields)]);

  const onRigNext = React.useCallback(async () => {
    // Validate
    if (!rigForm.fields.make?.value) {
      dispatch(actions.forms.rig.setFieldError(["make", "Please select manufacturer"]));
      return false;
    }

    if (!rigForm.fields.model?.value) {
      dispatch(actions.forms.rig.setFieldError(["make", "Please enter a model name"]));
      return false;
    }

    // Create user rig
    try {
      const rig = rigForm.original?.id
        ? await mutationCreateRig.mutate({
          make: rigForm.fields.make.value,
          model: rigForm.fields.model.value,
          serial: rigForm.fields.serial.value,
          userId: Number(userForm.original.id),
        })
        : await mutationUpdateRig.mutate({
          id: Number(rigForm.original?.id),
          make: rigForm.fields.make.value,
          model: rigForm.fields.model.value,
          serial: rigForm.fields.serial.value,
          userId: Number(userForm.original.id),
        });

      dispatch(actions.forms.rig.setOpen(rig.rig));
      return true;
    } catch (_) {
      return false;
    }    
  }, [JSON.stringify(rigForm.fields), JSON.stringify(userForm.fields), JSON.stringify(userForm.original), JSON.stringify(rigForm.original)]);

  const onReserveRepackNext = React.useCallback(async () => {
    // Validate
    if (!rigForm.fields.repackExpiresAt?.value) {
      dispatch(actions.forms.rig.setFieldError(["repackExpiresAt", "Select repack date, even if it's in the past"]));
      return false;
    }

    // Update repack expiry date
    try {
      const rig = await mutationUpdateRig.mutate({
        id: Number(rigForm.original?.id),
        repackExpiresAt: rigForm.fields.repackExpiresAt.value,
      });
      dispatch(actions.forms.rig.setOpen(rig.rig));
      return true;
    } catch (_) {
      return false;
    }    
  }, [JSON.stringify(rigForm.fields), JSON.stringify(rigForm.original?.id)]);

  const onWingloadingNext = React.useCallback(async () => {
    // Validate
    if (!rigForm.fields.canopySize?.value) {
      dispatch(actions.forms.rig.setFieldError(["canopySize", "You must provide a canopy size"]));
      return false;
    }

    if (!userForm.fields.exitWeight?.value) {
      dispatch(actions.forms.user.setFieldError(["exitWeight", "You must enter your exit weight"]));
      return false;
    }

    // Update repack expiry date
    try {
      const rig = await mutationUpdateRig.mutate({
        id: Number(rigForm.original?.id),
        canopySize: rigForm.fields.canopySize.value,
      });
      const user = await mutationUpdateUser.mutate({
        id: Number(userForm.original?.id),
        exitWeight: Number(userForm.fields.exitWeight?.value),
      });
      
      dispatch(actions.forms.userWizard.setOpen(false));
      dispatch(actions.forms.userWizard.reset());
      dispatch(actions.forms.user.reset());
      dispatch(actions.forms.rig.reset());
    } catch (e) {
      console.log(e);
      return false;
    }    
  }, [JSON.stringify(rigForm.fields), JSON.stringify(userForm.fields), rigForm.original?.id, dispatch]);

  
  const onNextStep = React.useCallback(async (index): Promise<boolean> => {
    switch (index) {
      case 0:
        return onFederationNext();
      case 1:
        return onRigNext();
      case 2:
        return onReserveRepackNext();
      case 3:
        return onWingloadingNext();
    }
  }, [onFederationNext, onRigNext, onReserveRepackNext, onWingloadingNext]);


  return (
    <Portal>
      <Modal
        visible={state.open}
        dismissable={false}
        style={styles.modal}
        contentContainerStyle={{ height: "100%" }}
      >

          <Wizard
            onNext={onNextStep}
            loading={mutationUpdateUser.loading || mutationUpdateRig.loading || mutationCreateRig.loading}
          >
            <FederationStep />
            <RigStep />
            <ReserveRepackStep />
            <WingloadingStep />
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
    backgroundColor: "red",
    display: "flex",
    width: "100%",
    height: "100%",
    flex: 1,
    alignItems: "center"
  }
})

export default UserWizardScreen;