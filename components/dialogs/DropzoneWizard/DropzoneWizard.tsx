import * as React from "react";
import { StyleSheet } from "react-native";
import { Portal, Modal } from "react-native-paper";
import Wizard from "../../wizard/Wizard";
import NameAndFederationStep from "./steps/Name";
import AircraftStep from "./steps/Aircraft";
import ThemingStep from "./steps/Theming";
import PermissionStep from "./steps/Permissions";
import TicketTypeStep from "./steps/TicketType";
import { actions, useAppDispatch, useAppSelector } from "../../../redux";
import useMutationCreateDropzone from "../../../graphql/hooks/useMutationCreateDropzone";
import useMutationUpdateDropzone from "../../../graphql/hooks/useMutationUpdateDropzone";
import useMutationCreatePlane from "../../../graphql/hooks/useMutationCreatePlane";
import useMutationUpdatePlane from "../../../graphql/hooks/useMutationUpdatePlane";
import useMutationCreateTicketType from "../../../graphql/hooks/useMutationCreateTicketType";
import useMutationUpdateTicketType from "../../../graphql/hooks/useMutationUpdateTicketType";
import { Permission } from "../../../graphql/schema.d";


function DropzoneWizardScreen() {
  const state = useAppSelector(state => state.forms.dropzoneWizard);
  const aircraft = useAppSelector(state => state.forms.plane);
  const ticket = useAppSelector(state => state.forms.ticketType);
  const dropzone = useAppSelector(state => state.forms.dropzone);
  const dispatch = useAppDispatch();

  const mutationCreateDropzone = useMutationCreateDropzone({
    onError: (error) => dispatch(actions.notifications.showSnackbar({ message: error, variant: "error" })),
    onSuccess: (payload) => console.log(payload),
    onFieldError: (field, value) =>
      dispatch(actions.forms.dropzone.setFieldError([field as any, value])),
  });
  const mutationUpdateDropzone = useMutationUpdateDropzone({
    onError: (error) => dispatch(actions.notifications.showSnackbar({ message: error, variant: "error" })),
    onSuccess: (payload) => console.log(payload),
    onFieldError: (field, value) =>
      dispatch(actions.forms.dropzone.setFieldError([field as any, value])),
  });
  const mutationCreatePlane = useMutationCreatePlane({
    onError: (error) => dispatch(actions.notifications.showSnackbar({ message: error, variant: "error" })),
    onSuccess: (payload) => console.log(payload),
    onFieldError: (field, value) =>
      dispatch(actions.forms.plane.setFieldError([field as any, value])),
  });
  const mutationUpdatePlane = useMutationUpdatePlane({
    onError: (error) => dispatch(actions.notifications.showSnackbar({ message: error, variant: "error" })),
    onSuccess: (payload) => console.log(payload),
    onFieldError: (field, value) =>
      dispatch(actions.forms.plane.setFieldError([field as any, value])),
  });
  const mutationCreateTicketType = useMutationCreateTicketType({
    onError: (error) => dispatch(actions.notifications.showSnackbar({ message: error, variant: "error" })),
    onSuccess: (payload) => console.log(payload),
    onFieldError: (field, value) =>
      dispatch(actions.forms.ticketType.setFieldError([field as any, value])),
  });
  const mutationUpdateTicketType = useMutationUpdateTicketType({
    onError: (error) => dispatch(actions.notifications.showSnackbar({ message: error, variant: "error" })),
    onSuccess: (payload) => console.log(payload),
    onFieldError: (field, value) =>
      dispatch(actions.forms.ticketType.setFieldError([field as any, value])),
  });


  const onBasicInfoNext = React.useCallback(async (): Promise<boolean> => {
    if (!dropzone.fields.name.value) {
      dispatch(actions.forms.dropzone.setFieldError(["name", "Your dropzone must have a name"]));
      return false;
    }

    if (!dropzone.fields.federation.value) {
      dispatch(actions.forms.dropzone.setFieldError(["federation", "Your dropzone must have an associated organization"]));
      return false;
    }

    return true;
  }, [JSON.stringify(dropzone.fields), dropzone.original]);

  const onThemingNext = React.useCallback(async (): Promise<boolean> => {
    if (!dropzone.fields.primaryColor.value) {
      dispatch(actions.forms.dropzone.setFieldError(["primaryColor", "Please pick a primary color"]));
      return false;
    }
    if (!dropzone.fields.secondaryColor.value) {
      dispatch(actions.forms.dropzone.setFieldError(["secondaryColor", "Please pick an accent color"]));
      return false;
    }

    // Create or update dropzone
    const result = !dropzone.original?.id
      ? await mutationCreateDropzone.mutate({
          federationId: Number(dropzone.fields.federation.value?.id),
          name: dropzone.fields.name.value,
          banner: "",
          primaryColor: dropzone.fields.primaryColor.value,
          secondaryColor: dropzone.fields.secondaryColor.value,
        })
      : await mutationUpdateDropzone.mutate({
          id: Number(dropzone.original.id),
          federationId: Number(dropzone.fields.federation.value?.id),
          name: dropzone.fields.name.value,
          primaryColor: dropzone.fields.primaryColor.value,
          secondaryColor: dropzone.fields.secondaryColor.value,
          banner: "",
        });


      if (!result.errors?.length && result.dropzone?.id) {
        dispatch(actions.forms.dropzone.setOpen(result.dropzone));
        dispatch(actions.global.setDropzone(result.dropzone));
        dispatch(actions.global.setPrimaryColor(result.dropzone.primaryColor));
        dispatch(actions.global.setAccentColor(result.dropzone.secondaryColor));
        return true;
      }
      return false;

  }, [JSON.stringify(dropzone.fields), dropzone.original]);

  const onAircraftNext = React.useCallback(async (): Promise<boolean> => {
    if (!aircraft.fields.name.value) {
      dispatch(actions.forms.plane.setFieldError(["name", "You must name your aircraft"]));
      return false;
    }
    if (!aircraft.fields.registration.value) {
      dispatch(actions.forms.plane.setFieldError(["registration", "Please provide aircraft registration"]));
      return false;
    }

    // Create or update dropzone
    const result = !aircraft.original?.id
      ? await mutationCreatePlane.mutate({
          dropzoneId: Number(dropzone.original.id),
          name: aircraft.fields.name.value,
          registration: aircraft.fields.registration.value,
          minSlots: aircraft.fields.minSlots.value,
          maxSlots: aircraft.fields.maxSlots.value,
        })
      : await mutationUpdatePlane.mutate({
          id: Number(aircraft.original.id),
          name: aircraft.fields.name.value,
          registration: aircraft.fields.registration.value,
          minSlots: aircraft.fields.minSlots.value,
          maxSlots: aircraft.fields.maxSlots.value,
        });


      if (!result.errors?.length && result.plane?.id) {
        dispatch(actions.forms.plane.setOpen(result.plane));
        return true;
      }
      return false;

  }, [JSON.stringify(aircraft.fields), dropzone.original, JSON.stringify(aircraft.original)]);


  const onTicketTypeNext = React.useCallback(async (): Promise<boolean> => {
    if (!ticket.fields.name.value) {
      dispatch(actions.forms.ticketType.setFieldError(["name", "You must name your ticket"]));
      return false;
    }

    if (!ticket.fields.cost.value) {
      dispatch(actions.forms.ticketType.setFieldError(["cost", "Tickets must have a price"]));
      return false;
    }

    // Create or update dropzone
    const result = !ticket.original?.id
      ? await mutationCreateTicketType.mutate({
          dropzoneId: Number(dropzone.original.id),
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


      if (!result.errors?.length && result.ticketType?.id) {
        dispatch(actions.forms.ticketType.setOpen(result.ticketType));
        return true;
      }
      return false;

  }, [JSON.stringify(ticket.fields), dropzone.original, JSON.stringify(ticket.original)]);
  
  const onNextStep = React.useCallback(async (index): Promise<boolean> => {
    switch (index) {
      case 0:
        return onBasicInfoNext();
      case 1:
        return onThemingNext();
      case 2:
        return onAircraftNext();
      case 3:
        return onTicketTypeNext();
      case 4:
        return true;
      case 5:
        dispatch(
          actions.global.setDropzone(dropzone.original)
        );
        dispatch(actions.forms.dropzoneWizard.setOpen(false));
        dispatch(actions.forms.dropzoneWizard.reset());
        dispatch(actions.forms.ticketType.reset());
        dispatch(actions.forms.plane.reset());
        dispatch(actions.forms.dropzone.reset());
      default:
        return false;
    }
  }, [onBasicInfoNext, onThemingNext, onAircraftNext, onTicketTypeNext]);


  return (
    <Portal>
      <Modal
        visible={state.open}
        dismissable={false}
        style={styles.modal}
      >
          <Wizard
            onNext={onNextStep}
            loading={
              mutationCreateDropzone.loading ||
              mutationUpdateDropzone.loading ||
              mutationCreatePlane.loading ||
              mutationUpdatePlane.loading ||
              mutationCreateTicketType.loading ||
              mutationUpdateTicketType.loading
            }
          >
            <NameAndFederationStep />
            <ThemingStep />
            { /* Dropzone should be created here */ }
            <AircraftStep />
            <TicketTypeStep />
            <PermissionStep title="Who can manifest?" permission={Permission.CreateSlot} />
            <PermissionStep title="Manifest other people?" permission={Permission.CreateUserSlot} />
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

export default DropzoneWizardScreen;